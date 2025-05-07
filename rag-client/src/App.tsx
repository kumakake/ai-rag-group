// src/App.tsx
import { useState, useEffect } from "react";
import UploadForm from "./components/UploadForm";
import PdfList from "./components/PdfList";
import QueryForm from "./components/QueryForm";
import SearchForm from "./components/SearchForm";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import AdminUploadForm from "./components/AdminUploadForm";
import AdminDashboard from "./components/AdminDashboard"; // 追加！
import AdminUserList from "./components/AdminUserList"; 
import AdminPdfUpload from "./components/AdminPdfUpload";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

function App() {
  const [user, setUser] = useState<any>(null);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [screen, setScreen] = useState<"main" | "admin">("main"); // 管理画面切替

  // セッション確認
  useEffect(() => {
    fetch(`${API_BASE}/auth/me`, {
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => {
        if (data.loggedIn) {
          setUser(data.user);
        }
      });
  }, []);

  const handleLogout = async () => {
    await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
    setScreen("main");
  };

  if (!user) {
    return (
      <>
        {mode === "login" ? (
          <>
            <LoginForm onLogin={setUser} />
            <p style={{ textAlign: "center" }}>
              アカウントをお持ちでない方は{" "}
              <button onClick={() => setMode("register")}>新規登録</button>
            </p>
          </>
        ) : (
          <>
            <RegisterForm onRegister={setUser} />
            <p style={{ textAlign: "center" }}>
              すでにアカウントをお持ちの方は{" "}
              <button onClick={() => setMode("login")}>ログイン</button>
            </p>
          </>
        )}
      </>
    );
  }

  if (screen === "admin" && user.is_admin) {
    return (
      <div style={{ padding: "2rem" }}>
        <h1>🛠 管理者画面</h1>
        <p>
          管理者：{user.name}（{user.email}）{" "}
          <button onClick={handleLogout}>ログアウト</button>{" "}
          <button onClick={() => setScreen("main")}>戻る</button>
        </p>
		<AdminDashboard user={user} setScreen={setScreen} />
      </div>
    );
  }

if (screen === "admin-users" && user.is_admin) {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>👥 ユーザー管理</h1>
      <p>
        管理者：{user.name}（{user.email}）{" "}
        <button onClick={handleLogout}>ログアウト</button>{" "}
        <button onClick={() => setScreen("admin")}>戻る</button>
      </p>
      <AdminUserList />
    </div>
  );
}

if (screen === "admin-upload" && user.is_admin) {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>📄 共通PDFアップロード</h1>
      <p>
        管理者：{user.name}（{user.email}）{" "}
        <button onClick={handleLogout}>ログアウト</button>{" "}
        <button onClick={() => setScreen("admin")}>戻る</button>
      </p>
      <AdminPdfUpload setScreen={setScreen} />
    </div>
  );
}

  return (
    <div style={{ padding: "2rem" }}>
      <h1>📚 RAG PDF 登録画面</h1>
      <p>
        ✅ ログイン中：{user.name}（{user.email}）{" "}
        <button onClick={handleLogout}>ログアウト</button>
        {user.is_admin && (
          <>
            {" "}
            <button onClick={() => setScreen("admin")}>管理画面へ</button>
          </>
        )}
      </p>
      <AdminUploadForm user={user} />
	  <UploadForm user={user} />
      <PdfList />
      <QueryForm user={user}/>
      <SearchForm />
    </div>
  );
}

export default App;

