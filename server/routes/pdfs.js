import express from "express";
import fs from "fs";
import path from "path";
import { db } from "../db.js";

const router = express.Router();
const baseDir = path.resolve("vectorstores");

router.get("/", async (req, res) => {
  console.log("/pdfs --> start");
  console.log( "session.user-->", req.session.user );

  const filter = req.query.filter || "all";
  const userId = req.session.user.id;

  try {
    let result;

	console.log( "pdfs/filter-->", filter );
	console.log( "pdfs/userId-->", userId );

    if (filter === "self") {
      // 自分のPDFのみ
      result = await db.query(
        "SELECT directory_name AS name, original_name FROM pdf_files WHERE user_id = $1 AND is_shared = false ORDER BY created_at DESC",
        [userId]
      );
    } else if (filter === "shared") {
      // 共通（全体公開）PDFのみ
      result = await db.query(
        "SELECT directory_name AS name, original_name FROM pdf_files WHERE is_shared = true ORDER BY created_at DESC"
      );
    } else {
      // すべて（共通PDF + 自分のPDF）
      result = await db.query(
        "SELECT directory_name AS name, original_name FROM pdf_files WHERE user_id = $1 OR is_shared = true ORDER BY created_at DESC",
        [userId]
      );
    }

	console.log( "pdfs/result-->", result.rows );

    res.json({ success: true, files: result.rows });
  } catch (err) {
    console.error("PDF一覧取得エラー:", err);
    res.status(500).json({ success: false, files: [] });
  }
});

// ユーザー自身のPDFのみ削除可能
router.delete("/:name", async (req, res) => {
  console.log("/pdfs/:name --> start");

  const userId = req.session.user.id;
  const dirName = req.params.name;

  try {
    // 所有チェック
    const check = await db.query(
      "SELECT * FROM pdf_files WHERE directory_name = $1 AND user_id = $2",
      [dirName, userId]
    );
    if (check.rows.length === 0) {
      return res.status(403).json({ success: false, message: "削除権限がありません" });
    }

    // 削除（DBとファイル）
    await db.query("DELETE FROM pdf_files WHERE directory_name = $1", [dirName]);
    fs.rmSync(path.join("vectorstores", dirName), { recursive: true, force: true });

    res.json({ success: true });
  } catch (err) {
    console.error("PDF削除エラー:", err);
    res.status(500).json({ success: false });
  }
});

export default router;

