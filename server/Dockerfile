FROM node:20

WORKDIR /app

# 必要なシステムライブラリをインストール
RUN apt-get update && apt-get install -y \
    build-essential \
    python3 \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm cache clean --force && \
    npm uninstall bcrypt && \
    npm install bcryptjs && \
    npm uninstall faiss-node && \
    npm install --no-cache

COPY . .

# bcryptをbcryptjsに置き換えるための変換スクリプトを追加
RUN echo "import fs from 'fs'; \
    const files = fs.readdirSync('./routes'); \
    for (const file of files) { \
      const filePath = './routes/' + file; \
      let content = fs.readFileSync(filePath, 'utf8'); \
      if (content.includes('bcrypt')) { \
        content = content.replace(/import bcrypt from ['\"]bcrypt['\"]/g, \"import bcrypt from 'bcryptjs'\"); \
        fs.writeFileSync(filePath, content); \
      } \
    }; \
    const authMiddleware = './middleware/auth.js'; \
    if (fs.existsSync(authMiddleware)) { \
      let content = fs.readFileSync(authMiddleware, 'utf8'); \
      if (content.includes('bcrypt')) { \
        content = content.replace(/import bcrypt from ['\"]bcrypt['\"]/g, \"import bcrypt from 'bcryptjs'\"); \
        fs.writeFileSync(authMiddleware, content); \
      } \
    };" > replace-bcrypt.js && \
    node replace-bcrypt.js && \
    rm replace-bcrypt.js

CMD ["node", "app.js"]

