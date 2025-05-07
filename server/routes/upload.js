import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { extractTextFromPDF } from "../utils/pdf-extract.js";
import { db } from "../db.js"; // PostgreSQL接続

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("pdf"), async (req, res) => {
  const file = req.file;
  const sessionUser = req.session?.user;

  if (!file || !sessionUser) {
    return res.status(400).json({ success: false, error: "ファイルまたは認証情報がありません" });
  }

  try {
    // Macの文字化け対策（latin1 → utf8）
    const rawName = path.parse(file.originalname).name;
    const originalName = Buffer.from(rawName, "latin1").toString("utf8");

    const pdfPath = file.path;
    const text = await extractTextFromPDF(pdfPath);
    await fs.unlink(pdfPath); // 一時PDFを削除

    // 文書分割（より細かく分割してトークン制限に対応）
    const splitter = new RecursiveCharacterTextSplitter({ 
      chunkSize: 200, 
      chunkOverlap: 20,
      separators: ["\n\n", "\n", " ", ""]
    });

    // is_shared の判定（管理者以外は false 強制）
//    const rawCommon = req.body.is_common === "true" || req.body.is_common === true;
    const rawCommon = req.body.is_shared === "true" || req.body.is_shared === true;
    const isCommon = sessionUser.is_admin ? rawCommon : false;

    // 保存ディレクトリ
    const dirName = (isCommon ? "common_" : "pdf_") + Date.now();
    const savePath = path.join("vectorstores", isCommon ? "common" : "", dirName);

    const splitDocs = await splitter.createDocuments([text], {
      metadata: {
        source: originalName, // 表示名
        sourceId: dirName     // ユニークID
      },
    });

	if (!splitDocs.length) {
		return res.status(400).json({ success: false, error: "PDFからテキストを抽出できませんでした" });
	}

    const vectorStore = await MemoryVectorStore.fromDocuments(
      splitDocs, 
      new OpenAIEmbeddings({
        batchSize: 5, // 一度に処理するドキュメント数を少なくする
        maxRetries: 10 // リトライ回数を増やす
      })
    );
    
    // JSONとして保存する（MemoryVectorStoreはsave/loadメソッドを持たないため）
    const jsonData = {
      // エンベディングと関連情報を保存
      documents: splitDocs.map(doc => ({ 
        pageContent: doc.pageContent, 
        metadata: doc.metadata 
      })),
      vectors: vectorStore.memoryVectors
    };
    
    await fs.mkdir(savePath, { recursive: true });
    await fs.writeFile(
      path.join(savePath, "vectorstore.json"),
      JSON.stringify(jsonData, null, 2)
    );

    // meta.json 保存
    await fs.writeFile(
      path.join(savePath, "meta.json"),
      JSON.stringify({ originalName }, null, 2)
    );

    // DB登録
    await db.query(
      `INSERT INTO pdf_files (directory_name, original_name, user_id, is_shared)
       VALUES ($1, $2, $3, $4)`,
      [dirName, originalName, sessionUser.id, isCommon]
    );

    res.json({ success: true, file: originalName });
  } catch (err) {
    console.error("アップロードエラー:", err);
    res.status(500).json({ success: false, error: "アップロードに失敗しました" });
  }
});

export default router;

