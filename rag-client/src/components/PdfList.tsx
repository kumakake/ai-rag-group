import React, { useEffect, useState } from "react";
import { API_BASE } from "../config";

type PdfInfo = {
  name: string;
  originalName?: string;
};

const PdfList: React.FC = () => {
  const [files, setFiles] = useState<PdfInfo[]>([]);
  const [filter, setFilter] = useState<"all" | "self" | "shared">("all");
  const [loading, setLoading] = useState(false);

  const fetchPdfs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/pdfs?filter=${filter}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.files) {
        setFiles(data.files);
      }
    } catch (err) {
      console.error("PDF一覧取得エラー:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (name: string) => {
    if (!window.confirm("このPDFを削除しますか？")) return;
    try {
      const res = await fetch(`${API_BASE}/pdfs/${name}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setFiles((prev) => prev.filter((f) => f.name !== name));
      }
    } catch (err) {
      console.error("削除エラー:", err);
    }
  };

  useEffect(() => {
    fetchPdfs();
  }, [filter]);

  return (
    <div style={{ padding: "1rem" }}>
      <h2>📂 登録済みPDF一覧</h2>

      <div style={{ marginBottom: "1rem" }}>
        表示対象：
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as "all" | "self" | "shared")}
          style={{ marginLeft: "0.5rem", padding: "0.3rem" }}
        >
          <option value="all">すべて</option>
          <option value="self">自分のPDF</option>
          <option value="shared">共通PDF</option>
        </select>
      </div>

      {loading ? (
        <p>📄 読み込み中...</p>
      ) : files.length === 0 ? (
        <p>📭 PDFが見つかりません。</p>
      ) : (
        <ul>
          {files.map((f) => (
            <li key={f.name} style={{ marginBottom: "0.5rem" }}>
              {f.originalName || f.name}
              <button
                style={{ marginLeft: "1rem" }}
                onClick={() => handleDelete(f.name)}
              >
                🗑 削除
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PdfList;

