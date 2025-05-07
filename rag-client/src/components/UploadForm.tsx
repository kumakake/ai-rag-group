import { useState } from "react";
const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function UploadForm({ user }: { user: any }) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isShared, setIsShared] = useState(false); // ← 追加
  const [status, setStatus] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setStatus("");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("pdf", selectedFile);

    // 管理者なら共通PDFとしての指定を追加
    if (user?.is_admin) {
      formData.append("is_shared", String(isShared));
    }

    try {
      const res = await fetch(API_URL + "/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setStatus(`✅ アップロード成功：${data.file}`);
        setSelectedFile(null);
        setIsShared(false);
      } else {
        setStatus("❌ アップロード失敗");
      }
    } catch (err) {
      console.error(err);
      setStatus("⚠️ 通信エラー");
    }
  };

  return (
    <div style={{ padding: "1rem", border: "1px solid #ccc", borderRadius: "8px" }}>
      <h2>📄 PDFアップロード</h2>
      <input type="file" accept=".pdf" onChange={handleFileChange} />
      
      {/* 管理者にのみ表示 */}
      {user?.is_admin && (
        <div style={{ marginTop: "1rem" }}>
          <label>
            <input
              type="checkbox"
              checked={isShared}
              onChange={(e) => setIsShared(e.target.checked)}
            />
            全体公開（共通PDFとして登録）
          </label>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!selectedFile}
        style={{ marginTop: "1rem" }}
      >
        アップロード
      </button>

      <p>{status}</p>
    </div>
  );
}

