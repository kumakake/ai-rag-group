import { useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function AdminUploadForm({ user }: { user: any }) {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!file) {
      setMessage("ファイルを選択してください");
      return;
    }

    const formData = new FormData();
    formData.append("pdf", file);

    try {
      const res = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`✅ アップロード成功: ${data.file}`);
      } else {
        setMessage("❌ アップロードに失敗しました");
      }
    } catch (err) {
      console.error(err);
      setMessage("⚠️ 通信エラーが発生しました");
    }
  };

  if (!user?.is_admin) return null;

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: "2rem" }}>
      <h3>📂 共通PDFのアップロード（管理者用）</h3>
      <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <button type="submit" style={{ marginLeft: "1rem" }}>アップロード</button>
      {message && <p style={{ marginTop: "0.5rem", color: "#333" }}>{message}</p>}
    </form>
  );
}

