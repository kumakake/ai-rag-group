import React, { useEffect, useState } from "react";

interface TokenStat {
  user_id: number;
  name: string;
  email: string;
  query_count: number;
  total_tokens: number;
  prompt_tokens: number;
  completion_tokens: number;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export default function AdminTokenStats() {
  const [stats, setStats] = useState<TokenStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/admin/token-usage`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setStats(data.data);
      })
      .catch((err) => console.error("取得エラー:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>📊 統計を読み込み中...</p>;

  return (
    <div style={{ marginTop: "2rem" }}>
      <h2>📊 トークン使用量統計</h2>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th style={th}>ユーザー名</th>
            <th style={th}>メールアドレス</th>
            <th style={th}>質問数</th>
            <th style={th}>総トークン</th>
            <th style={th}>入力</th>
            <th style={th}>出力</th>
          </tr>
        </thead>
        <tbody>
          {stats.map((s) => (
            <tr key={s.user_id}>
              <td style={td}>{s.name}</td>
              <td style={td}>{s.email}</td>
              <td style={td01}>{s.query_count}</td>
              <td style={td01}>{s.total_tokens}</td>
              <td style={td01}>{s.prompt_tokens}</td>
              <td style={td01}>{s.completion_tokens}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const th = {
  border: "1px solid #ccc",
  padding: "0.5rem",
  background: "#f5f5f5",
  color: "black",
  textAlign: "center" as const,
};

const td = {
  border: "1px solid #ccc",
  padding: "0.5rem",
};
const td01 = {
  border: "1px solid #ccc",
  padding: "0.5rem",
  textAlign: "right" as const,
};

