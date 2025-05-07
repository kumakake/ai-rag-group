# 📚 RAG PDF Search System

AIを活用したPDF文書検索システムです。LangChain + OpenAI Embedding + FAISS によるベクトル検索をベースに、複数ユーザー＆複数PDFの取り扱いが可能な強力なRAG環境を提供します。

---

## 🚀 主な機能

- ✅ PDF文書をアップロードし、内容をベクトル化して検索可能に
- ✅ ChatGPTベースの自然言語質問→回答生成
- ✅ 共通PDF / 個人用PDF の管理機能（管理者/一般ユーザー分離）
- ✅ PostgreSQLでユーザー・PDF情報を一元管理
- ✅ 管理者によるユーザー管理・PDF管理・トークン使用量の統計閲覧
- ✅ Docker Composeによる簡易開発＆本番デプロイ

---

## 📦 構成

| コンポーネント     | 説明 |
|------------------|------|
| `server/`     | Node.js + Express のバックエンド。PDF解析・MemoryVectorStore登録・質問応答APIなど |
| `rag-client/`     | React + Vite のフロントエンド。PDF管理、質問入力、管理者画面など |
| `postgresql`      | ユーザー・PDF情報・ログの保存 |
| `docker-compose.yml` | 全体の起動・連携を管理 |

---

## 🔧 セットアップ手順

### 1. 環境変数ファイル `.env` を作成

```env
OPENAI_API_KEY=your_openai_api_key
SESSION_SECRET=your_session_secret
DATABASE_URL=postgresql://postgres:yourpassword@db:5432/ragdb

### 2. Docker コンテナの起動
docker compose up --build
起動後、以下のURLでアクセスできます：
- フロントエンド: http://localhost:5173
- APIサーバー: http://localhost:3000

## 🧪 利用方法
### 1. 一般ユーザー
- サインアップ後、個人用のPDFをアップロード
- アップロードしたPDFを選択して質問を入力
- 回答と参考文献が表示されます

### 2. 管理者ユーザー
- 管理画面にアクセスし、以下を操作可能：
  - 👤 ユーザー管理（一覧表示、削除）
  - 📄 共通PDFのアップロード／削除
  - 📊 トークン使用量統計の閲覧

## 🧠 技術スタック
- Frontend: React + TypeScript + TailwindCSS + Vite
- Backend: Node.js + Express + LangChain + MemoryVectorStore
- PDF解析: pdfjs-dist（worker不要構成）
- Auth: Express-session + PostgreSQL
- DB: PostgreSQL（初期化は /docker-entrypoint-initdb.d にて自動）

## 📁 ディレクトリ構成（抜粋）
.
├── rag-client/          # フロントエンド（React）
├── server/              # バックエンド（Node.js + Express）
│   ├── routes/          # 各機能のAPIルート（auth.js, query.js, upload.js など）
│   ├── utils/           # PDFテキスト抽出などのユーティリティ
│   └── db.js            # PostgreSQL 接続
├── db/init.sql          # 初期テーブル定義
├── docker-compose.yml   # コンテナ構成
└── .env                 # 環境変数（Git管理は除外）

## .env
OPENAI_API_KEY=your-openai-api-key
DATABASE_URL=postgresql://raguser:ragpass@db:5432/ragdb
SESSION_SECRET=your-session-secret-key
CLIENT_ORIGIN=http://localhost:5173

## 📜 ライセンス
MIT License

## 🙌 クレジット
このプロジェクトは、LangChain および OpenAI の技術を活用しています。

## 📬 お問い合わせ
質問・バグ報告・改善案などありましたら Issues よりお気軽にどうぞ！

---

必要に応じて、`yourname/your-repo` や `your_openai_api_key` などを変更してくださいね。  
他にも「デモGIFを貼りたい」「バッジを追加したい」など要望があれば気軽に言ってください！

## ライセンスについて（日本語訳）

このソフトウェアは MIT ライセンスのもとで提供されています。

以下はその非公式な日本語訳です：

---

MIT ライセンス

Copyright (c) 2025 スタジオくまかけ

本ソフトウェアおよび付随するドキュメントファイル（以下「ソフトウェア」）のコピーを取得するすべての人に対し、  
制限なく使用、複製、改変、結合、掲載、配布、サブライセンス、および/または販売する権利を無償で許可します。  
また、ソフトウェアを提供された人に同様の権利を許可することもできます。

ただし、上記の著作権表示および本許可表示をソフトウェアのすべてのコピーまたは重要な部分に記載するものとします。

本ソフトウェアは「現状のまま」で提供され、明示または黙示を問わず、  
商品性、特定目的への適合性、および権利非侵害についての保証を含め、  
一切の保証を行いません。  
作者または著作権者は、契約行為、不法行為、またはそれ以外であっても、  
ソフトウェアまたはその使用、またはその他の取り扱いによって生じたいかなる請求、損害、その他の責任についても  
一切責任を負わないものとします。

---

※ この日本語訳は参考であり、法的効力を持つのは英語原文です。

