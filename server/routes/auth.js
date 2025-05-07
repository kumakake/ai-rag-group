import express from "express";
import bcrypt from "bcrypt";
import { db } from "../db.js";

const router = express.Router();

// ユーザー登録
router.post("/register", async (req, res) => {
  console.log( "/auth/register-->start" );

  const { email, password, name } = req.body;
  const hash = await bcrypt.hash(password, 10);
  try {
    await db.query(
      "INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3)",
      [email, hash, name]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("登録エラー:", err);
    res.status(400).json({ success: false, message: "登録失敗" });
  }
});

// ログイン
router.post("/login", async (req, res) => {
  console.log( "/auth/login-->start" );

  const { email, password } = req.body;
  const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
  const user = result.rows[0];

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ success: false, message: "認証失敗" });
  }

  req.session.user = {
    id: user.id,
    email: user.email,
    name: user.name,
    is_admin: user.is_admin,
  };
  res.json({ success: true, user: req.session.user });
});

// ログアウト
router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

// ログイン状態確認
router.get("/me", (req, res) => {
  if (req.session.user) {
    res.json({ loggedIn: true, user: req.session.user });
  } else {
    res.json({ loggedIn: false });
  }
});

export default router;

