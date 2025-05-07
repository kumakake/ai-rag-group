import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import slugify from "slugify";
import { requireLogin, requireAdmin } from "../middleware/auth.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", requireLogin, requireAdmin, upload.single("pdf"), async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ success: false, message: "PDFが必要です" });

  try {
    const loader = new PDFLoader(file.path);
    const docs = await loader.load();

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 200,
      chunkOverlap: 20,
      separators: ["\n\n", "\n", " ", ""]
    });
    const splitDocs = await splitter.splitDocuments(docs);

    // 元ファイル名（文字化け対策）
    const rawName = path.parse(file.originalname).name;
    const originalName = Buffer.from(rawName, "latin1").toString("utf8");

    // 保存先：vectorstores/common/<slugifiedName_uuid>
    const slug = slugify(originalName, { remove: /[*+~.()'"!:@、]/g });
    const dirName = `${slug}_${uuidv4()}`;
    const savePath = path.join("vectorstores", "common", dirName);

    await fs.mkdir(savePath, { recursive: true });

    // 埋め込み生成 & 保存
    const vectorStore = await MemoryVectorStore.fromDocuments(
      splitDocs, 
      new OpenAIEmbeddings({
        batchSize: 5, // 一度に処理するドキュメント数を少なくする
        maxRetries: 10 // リトライ回数を増やす
      })
    );
    
    // JSONとして保存する
    const jsonData = {
      documents: splitDocs.map(doc => ({ 
        pageContent: doc.pageContent, 
        metadata: doc.metadata 
      })),
      vectors: vectorStore.memoryVectors
    };
    
    await fs.writeFile(
      path.join(savePath, "vectorstore.json"),
      JSON.stringify(jsonData, null, 2)
    );

    // meta.json 保存
    const meta = {
      originalName,
      isCommon: true,
    };
    await fs.writeFile(path.join(savePath, "meta.json"), JSON.stringify(meta, null, 2), "utf8");

    res.json({ success: true });
  } catch (err) {
    console.error("共通PDFアップロードエラー:", err);
    res.status(500).json({ success: false });
  } finally {
    await fs.unlink(file.path).catch(() => {});
  }
});

export default router;

