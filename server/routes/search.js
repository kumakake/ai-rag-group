import express from "express";
import fs from "fs";
import path from "path";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Document } from "langchain/document";
import { db } from "../db.js";

const router = express.Router();

// ベクターストアの親ディレクトリ
const baseDir = path.resolve("vectorstores");

router.post("/", async (req, res) => {
  const { keyword, targetPdf } = req.body;

  if (!keyword || keyword.trim() === "") {
    return res.status(400).json({ success: false, error: "検索語が空です。" });
  }

  try {
//    const dirs = fs
//      .readdirSync(baseDir)
//      .filter((f) => fs.statSync(path.join(baseDir, f)).isDirectory());

    let dirs = [];

    if (targetPdf) {
      dirs = [targetPdf];
    } else {
      // メインディレクトリのベクターストアを検索
      const entries = fs.readdirSync(baseDir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          dirs.push(entry.name);
        }
      }

      // 共通ディレクトリのベクターストアも検索
      const commonDir = path.join(baseDir, "common");
      if (fs.existsSync(commonDir)) {
        const commonEntries = fs.readdirSync(commonDir, { withFileTypes: true });
        for (const entry of commonEntries) {
          if (entry.isDirectory()) {
            dirs.push(path.join("common", entry.name));
          }
        }
      }
    }

    const allMatches = [];

    for (const dir of dirs) {
      try {
        const storePath = path.join(baseDir, dir);
        const vectorstorePath = path.join(storePath, "vectorstore.json");
        
        if (!fs.existsSync(vectorstorePath)) {
          console.log(`${vectorstorePath} が見つかりません`);
          continue;
        }
        
        // JSONからデータを読み込む
        const jsonData = JSON.parse(fs.readFileSync(vectorstorePath, 'utf8'));
        
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
        
        // MemoryVectorStoreを作成
        const embeddings = new OpenAIEmbeddings();
        const store = await MemoryVectorStore.fromDocuments(documents, embeddings);
        
        // 検索実行
        const docs = await store.similaritySearch(keyword, 5); // 上位5件取得
        
        // ドキュメントごとにソース情報を整形して追加
        for (const doc of docs) {
          const sourceId = doc.metadata?.sourceId;
          
          if (sourceId) {
            try {
              // データベースからオリジナル名を取得
              const result = await db.query(
                "SELECT directory_name, original_name FROM pdf_files WHERE directory_name = $1 LIMIT 1",
                [sourceId]
              );
              
              if (result && result.rows && result.rows.length > 0) {
                const dirName = result.rows[0].directory_name || sourceId;
                const originalName = result.rows[0].original_name || '不明';
                allMatches.push({
                  source: `${dirName} / ${originalName}`,
                  text: doc.pageContent,
                });
              } else {
                allMatches.push({
                  source: `${sourceId} / 不明なファイル`,
                  text: doc.pageContent,
                });
              }
            } catch (err) {
              // エラー時はsourceIdのみ表示
              allMatches.push({
                source: `${sourceId} / 不明なファイル`,
                text: doc.pageContent,
              });
            }
          } else {
            // sourceIdがなければディレクトリ名を使用
            allMatches.push({
              source: dir || "不明な文献",
              text: doc.pageContent,
            });
          }
        }
      } catch (err) {
        console.error(`${dir}の検索中にエラー:`, err);
      }
    }

    res.json({ success: true, results: allMatches });
  } catch (err) {
    console.error("検索エラー:", err);
    res.status(500).json({ success: false, error: "検索に失敗しました。" });
  }
});

export default router;

