import express from "express";
import path from "path";
import fs from "fs/promises";
import { readFileSync, existsSync } from "fs";
import { db } from "../db.js";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";
import { RunnableSequence } from "@langchain/core/runnables";
import { ConsoleCallbackHandler } from "@langchain/core/tracers/console";
import { Document } from "langchain/document";

const router = express.Router();

router.post("/", async (req, res) => {
  console.log( "qauery start-->" );
  console.log( "req.session.user-->", req.body.user_id );

  const { question, targetPdf, user_id } = req.body;

  try {
    const baseDir = "vectorstores";
    const allDocs = [];

    const dirs = [];

    if (targetPdf) {
      dirs.push(targetPdf);
    } else {
      // メインディレクトリのベクターストアを検索
      const entries = await fs.readdir(baseDir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          dirs.push(entry.name);
        }
      }

      // 共通ディレクトリのベクターストアも検索
      const commonDir = path.join(baseDir, "common");
      if (existsSync(commonDir)) {
        const commonEntries = await fs.readdir(commonDir, { withFileTypes: true });
        for (const entry of commonEntries) {
          if (entry.isDirectory()) {
            dirs.push(path.join("common", entry.name));
          }
        }
      }
    }

    // 全文検索対象ドキュメント収集
    for (const dir of dirs) {
      const storePath = path.join(baseDir, dir);
      console.log("query/path-->", storePath);
      const vectorstorePath = path.join(storePath, "vectorstore.json");
      
      try {
        if (!existsSync(vectorstorePath)) {
          console.log(`${vectorstorePath} が見つかりません`);
          continue;
        }
        
        // JSONからデータを読み込む
        const jsonData = JSON.parse(readFileSync(vectorstorePath, 'utf8'));
        
        // ドキュメントを復元
        const documents = jsonData.documents.map(
          doc => new Document({
            pageContent: doc.pageContent,
            metadata: {
              ...doc.metadata,
              sourceId: doc.metadata?.sourceId || dir, // ディレクトリ名をそのまま保持
              originalDir: dir // 元のディレクトリパスも保持
            }
          })
        );
        
        // MemoryVectorStoreを作成して検索
        const embeddings = new OpenAIEmbeddings();
        const store = await MemoryVectorStore.fromDocuments(documents, embeddings);
        const results = await store.similaritySearch(question, 3);
        allDocs.push(...results);
      } catch (err) {
        console.log("query/dir error", err);
      }
    }

    // PostgreSQLから originalName を取得して metadata に追加
    for (const doc of allDocs) {
      const sourceId = doc.metadata?.sourceId;
      // dirは不要なので削除
      
      if (sourceId) {
        try {
          const result = await db.query(
            "SELECT directory_name, original_name FROM pdf_files WHERE directory_name = $1 LIMIT 1",
            [sourceId]
          );
          if (result.rows.length > 0) {
            const dirName = result.rows[0].directory_name || sourceId;
            const originalName = result.rows[0].original_name || '不明';
            doc.metadata.source = `${dirName} / ${originalName}`;
          } else {
            // ディレクトリ名 / 不明 の形式にする
            doc.metadata.source = `${sourceId} / 不明なファイル`;
          }
        } catch {
          doc.metadata.source = `${sourceId} / 不明なファイル`;
        }
      } else {
        doc.metadata.source = "不明な文献";
      }
    }

    // LCELによるプロンプト＆回答生成
    const prompt = PromptTemplate.fromTemplate(`以下はユーザーの質問と、それに関連する文書の抜粋です。
質問: {question}
関連文書:
{context}

これらの文書に基づいて、質問に丁寧に日本語で答えてください。`);

    const chain = RunnableSequence.from([
      async (input) => ({
        question: input.question,
        context: allDocs.map((d) => d.pageContent).join("\n\n"),
      }),
      prompt,
      new ChatOpenAI({ temperature: 0 }),
    ]);

	const cnsCb = { callbacks: [new ConsoleCallbackHandler()] };
    const answer = await chain.invoke({ question }, cnsCb );
console.log( "answer-->", answer );
	// ✅ トークン情報の記録（あれば）
    const usage = answer?.usage ?? {};
    const total_tokens = usage.total_tokens || 0;
    const prompt_tokens = usage.prompt_tokens || 0;
    const completion_tokens = usage.completion_tokens || 0;

    await db.query(
      `INSERT INTO query_logs (user_id, query, result, total_tokens, prompt_tokens, completion_tokens)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [ user_id, question, answer.content, answer.usage_metadata.total_tokens, answer.usage_metadata.input_tokens, answer.usage_metadata.output_tokens ]
//      [ user_id, question, answer.content, total_tokens, prompt_tokens, completion_tokens]
    );

    res.json({
      success: true,
      answer: answer.content,
      references: allDocs.map((doc) => ({
        source: doc.metadata.source,
        pageContent: doc.pageContent,
      })),
    });
  } catch (err) {
    console.error("検索エラー:", err);
    res.status(500).json({ success: false, error: "検索に失敗しました" });
  }
});

export default router;

