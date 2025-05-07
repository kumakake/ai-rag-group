export function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: "未ログインです" });
  }
  next();
}

export function requireAdmin(req, res, next) {
  if (!req.session.user?.is_admin) {
    return res.status(403).json({ success: false, message: "管理者権限が必要です" });
  }
  next();
}

