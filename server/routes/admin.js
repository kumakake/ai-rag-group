import express from "express";
import { db } from "../db.js";
import { requireLogin, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// 🔒 認証ミドルウェア（すべて管理者のみ）
router.use(requireLogin);
router.use(requireAdmin);

// 1. ユーザー一覧取得
router.get("/users", async (req, res) => {
  try {
    const result = await db.query("SELECT id, name, email, is_admin, created_at FROM users ORDER BY id");
    res.json({ success: true, users: result.rows });
  } catch (err) {
    console.error("ユーザー一覧取得エラー:", err);
    res.status(500).json({ success: false });
  }
});

// 2. 管理者権限の切り替え
router.post("/users/:id/toggle-admin", async (req, res) => {
  const id = Number(req.params.id);
  const currentUserId = req.session.user.id;
  if (id === currentUserId) {
    return res.status(400).json({ success: false, message: "自分の権限は変更できません" });
  }

  try {
    await db.query("UPDATE users SET is_admin = NOT is_admin WHERE id = $1", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("権限切り替えエラー:", err);
    res.status(500).json({ success: false });
  }
});

// 3. ユーザー削除
router.delete("/users/:id", async (req, res) => {
  const id = Number(req.params.id);
  const currentUserId = req.session.user.id;
  if (id === currentUserId) {
    return res.status(400).json({ success: false, message: "自分自身は削除できません" });
  }

  try {
    await db.query("DELETE FROM users WHERE id = $1", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("ユーザー削除エラー:", err);
    res.status(500).json({ success: false });
  }
});

// ✅ 4. トークン使用量集計（管理者専用）
router.get("/token-usage", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        users.id AS user_id,
        users.name,
        users.email,
        COUNT(*) AS query_count,
        COALESCE(SUM(total_tokens), 0) AS total_tokens,
        COALESCE(SUM(prompt_tokens), 0) AS prompt_tokens,
        COALESCE(SUM(completion_tokens), 0) AS completion_tokens
      FROM users
      LEFT JOIN query_logs ON users.id = query_logs.user_id
      GROUP BY users.id, users.name, users.email
      ORDER BY total_tokens DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("トークン統計エラー:", err);
    res.status(500).json({ success: false, error: "統計情報の取得に失敗しました。" });
  }
});

export default router;

