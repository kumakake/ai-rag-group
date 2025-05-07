import { useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function RegisterForm({ onRegister }: { onRegister: (user: any) => void }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, name, password }),
      });

      const data = await res.json();
      if (data.success) {
        // 登録後、自動でログインも行う
        const loginRes = await fetch(`${API_BASE}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        });
        const loginData = await loginRes.json();
        if (loginData.success) {
          onRegister(loginData.user);
        } else {
          setError("ログインに失敗しました");
        }
      } else {
        setError(data.message || "登録に失敗しました");
      }
    } catch (err) {
      console.error(err);
      setError("通信エラーが発生しました");
    }
  };

  return (
    <form onSubmit={handleRegister} style={{ maxWidth: "400px", margin: "2rem auto" }}>
      <h2>新規登録</h2>
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
        <label>お名前：</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
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
        登録してログイン
      </button>
    </form>
  );
}

