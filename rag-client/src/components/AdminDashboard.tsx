import AdminTokenStats from "./AdminTokenStats";

export default function AdminDashboard({
  user,
  setScreen,
}: {
  user: any;
  setScreen: (screen: string) => void;
}) {
  return (
	<>
    <div style={{ padding: "1rem" }}>
      <h2>🛠 管理者ダッシュボード</h2>
      <p>ようこそ、{user.name}さん（{user.email}）</p>
      <div style={{ marginTop: "1.5rem" }}>
        <button onClick={() => setScreen("admin-users")} style={{ marginRight: "1rem" }} > 👥 ユーザー管理 </button>
        <button onClick={() => setScreen("admin-pdfs")} style={{ marginRight: "1rem" }} > 📄 PDF管理 </button>
        <button onClick={() => setScreen("admin-stats")}> 📊 利用状況（統計） </button>
		<button onClick={() => setScreen("admin-upload")}>📄 共通PDFアップロード</button>
      </div>
    </div>
	<AdminTokenStats />
	</>
  );
}

