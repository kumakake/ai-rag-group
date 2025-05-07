import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

type PdfItem = {
  name: string;          // vectorstore フォルダ名
  originalName: string;  // meta.json に書かれた日本語名
};

type Props = {
  selected: string;
  onChange: (value: string) => void;
};

export default function PdfSelector({ selected, onChange }: Props) {
  const [files, setFiles] = useState<PdfItem[]>([]);

  useEffect(() => {
    console.log("PdfSelelect fetch Start--->");
    const fetchPdfs = async () => {
      try {
		const res = await fetch(`${API_BASE}/pdfs`, {
			credentials: "include", // ← これを追加
		});
        const data = await res.json();
        console.log("PdfSelelect fetch data        --->", data);
        console.log("PdfSelelect fetch data.success--->", data.success);
        if (data.success) {
          setFiles(data.files || []);
        }
      } catch (err) {
        console.error("PDF一覧取得エラー:", err);
      }
    };

    fetchPdfs();
  }, []);

useEffect(() => {
  console.log("取得されたPDFリスト:", files);
}, [files]);


  return (
    <div style={{ marginBottom: "1rem" }}>
      <label htmlFor="pdfSelect">📂 対象PDF：</label>{" "}
      <select
        id="pdfSelect"
        value={selected}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">（すべて）</option>
        {files.map((f) => (
          <option key={f.name} value={f.name}>
            {f.originalName || f.name}
          </option>
        ))}
      </select>
    </div>
  );
}

