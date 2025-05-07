import { useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function LoginForm({ onLogin }: { onLogin: (user: any) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // ← セッションCookieを送るのに必須！
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (data.success) {
        onLogin(data.user); // 親に通知
      } else {
        setError(data.message || "ログインに失敗しました");
      }
    } catch (err) {
      console.error(err);
      setError("通信エラーが発生しました");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: "400px", margin: "2rem auto" }}>
      <h2>ログイン</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div style={{ marginBottom: "1rem" }}>
        <label>メールアドレス：</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: "100%" }}
        />
      </div>
      <div style={{ marginBottom: "1rem" }}>
        <label>パスワード：</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: "100%" }}
        />
      </div>
      <button type="submit" style={{ width: "100%", padding: "0.5rem" }}>
        ログイン
      </button>
    </form>
  );
}

