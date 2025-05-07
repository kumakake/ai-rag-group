import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

type User = {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
  created_at: string;
};

export default function AdminUserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [status, setStatus] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/users`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      } else {
        setStatus("⚠️ ユーザー一覧取得に失敗");
      }
    } catch (err) {
      console.error(err);
      setStatus("⚠️ 通信エラー");
    }
  };

  const toggleAdmin = async (id: number) => {
    await fetch(`${API_BASE}/admin/users/${id}/toggle-admin`, {
      method: "POST",
      credentials: "include",
    });
    fetchUsers();
  };

  const deleteUser = async (id: number) => {
    if (!confirm("本当に削除しますか？")) return;
    await fetch(`${API_BASE}/admin/users/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    fetchUsers();
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      <h2>👥 ユーザー管理</h2>
      {status && <p>{status}</p>}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>名前</th>
            <th>メール</th>
            <th>権限</th>
            <th>登録日</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.is_admin ? "管理者" : "一般"}</td>
              <td>{new Date(u.created_at).toLocaleString()}</td>
              <td>
                <button onClick={() => toggleAdmin(u.id)}>権限切替</button>{" "}
                <button onClick={() => deleteUser(u.id)}>削除</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

