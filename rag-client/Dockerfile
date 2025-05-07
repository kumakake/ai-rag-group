FROM node:20

WORKDIR /app

COPY package*.json ./

# グローバルにviteをインストール
RUN npm install -g vite

# パッケージをインストール
RUN npm install

COPY . .

EXPOSE 5173

# グローバルのviteを直接使用
CMD ["vite", "--host"]

