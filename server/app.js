import express from "express";
import dotenv from "dotenv";
dotenv.config();

import uploadRouter from "./routes/upload.js";
import pdfsRouter from "./routes/pdfs.js";
import queryRouter from "./routes/query.js";
import searchRouter from "./routes/search.js";
import session from "express-session";
import authRouter from "./routes/auth.js";
import adminRouter from "./routes/admin.js";
import uploadAdminRouter from "./routes/upload_admin.js";

import cors from "cors";

const app = express();
const port = 3000;

app.use(cors({
  origin: "http://localhost:5173", // フロントのURLを明示！
  credentials: true,               // セッションクッキーを許可
}));

app.use(express.json()); // JSONの受け取り

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // HTTPSのみならtrue
}));

app.use("/auth", authRouter);
app.use("/upload", uploadRouter);
app.use("/pdfs", pdfsRouter);
app.use("/query", queryRouter);
app.use("/search", searchRouter);
app.use("/admin", adminRouter); 
app.use("/admin-upload", uploadAdminRouter);

app.listen(port, () => {
  console.log(`RAG PDF Server running at http://localhost:${port}`);
});

