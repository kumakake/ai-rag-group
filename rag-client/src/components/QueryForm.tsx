import { useState } from "react";
import PdfSelector from "./PdfSelector";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export default function QueryForm({ user }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [references, setReferences] = useState<string[]>([]); // 参考文献を追加
  const [loading, setLoading] = useState(false);
  const [targetPdf, setTargetPdf] = useState("");

  const handleSubmit = async () => {
    if (!question.trim()) return;

    setLoading(true);
    setAnswer("");
    setReferences([]); // 初期化

    try {
      const res = await fetch(`${API_BASE}/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
		  question,
		  targetPdf,
		  user_id: user?.id
		}),
      });
      const data = await res.json();
      if (data.success) {
        setAnswer(data.answer);
        setReferences(data.references || []); // 参考文献をセット
      } else {
        setAnswer("❌ 回答取得に失敗しました");
      }
    } catch (err) {
      console.error(err);
      setAnswer("⚠️ 通信エラー");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: "2rem" }}>
      <h2>💬 質問してみる</h2>
	  <PdfSelector selected={targetPdf} onChange={setTargetPdf} />
      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        rows={3}
        style={{ width: "100%", marginBottom: "1rem" }}
        placeholder="例：この資料の目的は何ですか？"
      />
      <br />
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "検索中..." : "質問する"}
      </button>

      {/* 回答 */}
      {answer && (
        <div style={{ marginTop: "1rem", background: "#f0f0f0", padding: "1rem", borderRadius: "8px", color: "#000" }}>
          <strong>🧠 回答：</strong>
          <p style={{ color: "#333" }}>{answer}</p>
        </div>
      )}

      {/* 参考文献 */}
      {references.length > 0 && (
        <div style={{ marginTop: "1rem", background: "#e8f4fd", padding: "1rem", borderRadius: "8px", color: "#000" }}>
          <strong>📖 参考文献：</strong>
          <ul>
            {references.map((ref, index) => (
              <li key={index} style={{ marginBottom: "0.5rem", color: "#555" }}>
                <strong>{ref.source}：</strong> {ref.pageContent}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

