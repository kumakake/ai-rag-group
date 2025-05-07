import { useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function AdminPdfUpload({ setScreen }: { setScreen: (screen: string) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("pdf", file);

    try {
      const res = await fetch(`${API_BASE}/admin-upload`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setStatus("✅ アップロード成功！");
      } else {
        setStatus("❌ アップロード失敗");
      }
    } catch (err) {
      console.error(err);
      setStatus("⚠️ 通信エラー");
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>📄 共通PDFアップロード（管理者）</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <button type="submit" style={{ marginLeft: "1rem" }}>
          アップロード
        </button>
      </form>
      <p style={{ marginTop: "1rem" }}>{status}</p>
      <button onClick={() => setScreen("admin")}>← 管理画面に戻る</button>
    </div>
  );
}

