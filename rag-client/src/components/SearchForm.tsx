import { useState } from "react";
import PdfSelector from "./PdfSelector";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export default function SearchForm() {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<{ source: string; text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [targetPdf, setTargetPdf] = useState("");

  const handleSearch = async () => {
    if (!keyword.trim()) return;

    setLoading(true);
    setResults([]);

    try {
      const res = await fetch(`${API_BASE}/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword, targetPdf }),
      });
      const data = await res.json();
      if (data.success) {
        setResults(data.results);
      } else {
        alert("検索に失敗しました");
      }
    } catch (err) {
      console.error(err);
      alert("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const highlight = (text: string) => {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // 正規表現エスケープ
    const regex = new RegExp(`(${escaped})`, "gi");
    return text.replace(regex, "<mark>$1</mark>");
  };

  return (
    <div style={{ marginTop: "2rem" }}>
      <h2>🔍 全文検索</h2>
	  <PdfSelector selected={targetPdf} onChange={setTargetPdf} />
      <input
        type="text"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="キーワードを入力"
        style={{ width: "70%", marginRight: "1rem" }}
      />
      <button onClick={handleSearch} disabled={loading}>
        {loading ? "検索中..." : "検索"}
      </button>

      {results.length > 0 && (
        <div style={{ marginTop: "1rem", background: "#f9f9f9", padding: "1rem", borderRadius: "8px", color: "#000" }}>
          <strong>🔎 検索結果：</strong>
          <ul>
            {results.map((r, index) => (
              <li key={index} style={{ marginBottom: "0.75rem" }}>
                <div style={{ fontSize: "0.85rem", color: "#888" }}>{r.source}</div>
                <div
                  dangerouslySetInnerHTML={{ __html: highlight(r.text) }}
                  style={{ marginTop: "0.25rem", lineHeight: 1.5 }}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

