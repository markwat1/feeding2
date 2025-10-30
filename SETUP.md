# セットアップガイド

このドキュメントでは、ペット管理システムの詳細なセットアップ手順を説明します。

## システム要件

- Node.js 18.0.0 以上
- npm 9.0.0 以上
- 最低 1GB の空きディスク容量
- モダンな Web ブラウザ（Chrome, Firefox, Safari, Edge）

## 詳細インストール手順

### 1. Node.js のインストール確認

```bash
node --version
npm --version
```

Node.js 18 以上と npm 9 以上がインストールされていることを確認してください。

### 2. プロジェクトのクローンと移動

```bash
git clone <repository-url>
cd pet-care-tracker
```

### 3. 依存関係のインストール

```bash
# 全ての依存関係を一括インストール
npm run install:all
```

このコマンドは以下を実行します：

- ルートディレクトリの依存関係をインストール
- サーバー（`server/`）の依存関係をインストール
- クライアント（`client/`）の依存関係をインストール

### 4. 環境設定（オプション）

環境変数を設定する場合は、以下のファイルを作成してください：

#### server/.env

```
PORT=3001
NODE_ENV=development
DB_PATH=./data/pet_care.db
```

#### client/.env

```
VITE_API_URL=http://localhost:3001
```

## 開発環境と本番環境の違い

### 開発環境（npm run dev）

- **2 つのサーバーが起動**：
  - フロントエンド: Vite 開発サーバー（ポート 3000）
  - バックエンド: Express サーバー（ポート 3001）
- **ホットリロード**: コード変更時に自動更新
- **デバッグ機能**: 開発者ツールとの連携

### 本番環境（npm start）

- **1 つのサーバーのみ起動**：
  - Express サーバー（ポート 3001）のみ
- **静的ファイル配信**: ビルド済み React アプリを配信
- **最適化**: 圧縮・最適化されたファイルを使用

## 開発環境での起動

### 方法 1: 同時起動（推奨）

```bash
npm run dev
```

このコマンドでフロントエンドとバックエンドが同時に起動します。

### 方法 2: 個別起動

別々のターミナルで以下を実行：

```bash
# ターミナル1: バックエンド
npm run server:dev

# ターミナル2: フロントエンド
npm run client:dev
```

### 起動確認

**開発環境（npm run dev）:**

- フロントエンド: http://localhost:3000
- バックエンド API: http://localhost:3001
- ヘルスチェック: http://localhost:3001/api/health

**本番環境（npm start）:**

- アプリケーション: http://localhost:3001
- ヘルスチェック: http://localhost:3001/api/health

## 本番環境での起動

### 1. ビルド

```bash
npm run build
```

### 2. 本番サーバー起動

```bash
NODE_ENV=production npm start
```

**重要**: 本番環境では、フロントエンドとバックエンドが統合されて **http://localhost:3001** で動作します。

### 本番環境の仕組み

- **クライアントサーバーは起動しません**（これは正常な動作です）
- サーバーが `client/dist` からビルド済みの静的ファイルを配信
- 1 つのサーバー（ポート 3001）ですべてを処理
- フロントエンドの React アプリもサーバーから配信される

## データベースの初期化

初回起動時に自動的に SQLite データベースが作成されます。

データベースファイルの場所: `server/data/pet_care.db`

### 手動でデータベースをリセットする場合

```bash
# データベースファイルを削除
rm server/data/pet_care.db

# サーバーを再起動（自動的に再作成される）
npm run server:dev
```

## テストの実行

### 全テスト実行

```bash
npm test
```

### 個別テスト実行

```bash
# バックエンドテスト
npm run server:test

# フロントエンドテスト
npm run client:test
```

### テスト監視モード

```bash
# バックエンド
cd server && npm run test:watch

# フロントエンド
cd client && npm run test:watch
```

## 開発ツール

### ESLint と Prettier の設定

コードの品質と整合性を保つため、ESLint と Prettier が設定されています。

```bash
# リンティング実行
npm run lint

# フォーマット実行
npm run format
```

### VSCode 設定（推奨）

`.vscode/settings.json`を作成：

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

推奨拡張機能：

- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint
- TypeScript Importer

## トラブルシューティング

### ポート競合エラー

```bash
# ポート使用状況確認
lsof -i :3000
lsof -i :3001

# プロセス終了
kill -9 <PID>
```

### 依存関係エラー

```bash
# node_modulesを削除して再インストール
rm -rf node_modules server/node_modules client/node_modules
rm package-lock.json server/package-lock.json client/package-lock.json
npm run install:all
```

### TypeScript エラー

```bash
# TypeScriptキャッシュクリア
npx tsc --build --clean
```

### 型定義エラー（Cannot find module 'express'など）

```bash
# サーバー側の依存関係を再インストール
cd server
rm -rf node_modules package-lock.json
npm install

# 型定義パッケージが不足している場合
npm install --save-dev @types/express @types/cors @types/node
```

### TypeScript 型定義ファイルエラー（Cannot find type definition file for 'node'）

```bash
# tsconfig.jsonの設定を確認
# "types": ["node"] を削除して自動検出に任せる
# または以下のように修正：
```

```json
{
  "compilerOptions": {
    "typeRoots": ["./node_modules/@types"],
    // "types": ["node"] を削除
    "moduleResolution": "node"
  }
}
```

### アクセスできない問題

**localhost:3000 にアクセスできない場合:**

```bash
# 開発環境を起動していることを確認
npm run dev

# 開発環境では localhost:3000 でフロントエンドにアクセス
```

**本番環境でアクセスできない場合:**

```bash
# 本番環境では localhost:3001 にアクセス
NODE_ENV=production npm start

# ビルドが完了していることを確認
npm run build

# client/dist ディレクトリが存在することを確認
ls -la client/dist/
```

**注意**: 本番環境では、クライアントサーバーは起動しません。これは正常な動作です。

### データベースエラー

```bash
# データディレクトリの権限確認
ls -la server/data/

# 権限修正（必要に応じて）
chmod 755 server/data/
chmod 644 server/data/pet_care.db
```

## パフォーマンス最適化

### 本番ビルドの最適化

```bash
# 本番用ビルド（最適化有効）
NODE_ENV=production npm run build
```

### データベース最適化

定期的にデータベースを最適化：

```sql
-- SQLiteデータベースに接続して実行
VACUUM;
ANALYZE;
```

## セキュリティ考慮事項

### 本番環境での注意点

1. 環境変数の設定
2. HTTPS の使用
3. データベースファイルの権限設定
4. 定期的な依存関係の更新

```bash
# 脆弱性チェック
npm audit
npm audit fix
```

## バックアップとリストア

### データベースバックアップ

```bash
# バックアップ作成
cp server/data/pet_care.db server/data/pet_care_backup_$(date +%Y%m%d).db
```

### リストア

```bash
# バックアップからリストア
cp server/data/pet_care_backup_YYYYMMDD.db server/data/pet_care.db
```

## 監視とログ

### ログファイル

- サーバーログ: コンソール出力
- エラーログ: コンソール出力
- アクセスログ: 必要に応じて設定

### 監視

本番環境では以下の監視を推奨：

- アプリケーションの稼働状況
- データベースファイルサイズ
- メモリ使用量
- レスポンス時間

## nginx を使用したWebサーバー設定

本番環境でnginxをリバースプロキシとして使用する場合の設定方法です。

### nginx のインストール

#### Ubuntu/Debian

```bash
sudo apt update
sudo apt install nginx
```

#### CentOS/RHEL

```bash
sudo yum install nginx
# または
sudo dnf install nginx
```

#### macOS

```bash
brew install nginx
```

### nginx 設定ファイル

`/etc/nginx/sites-available/pet-care-tracker` を作成：

```nginx
server {
    listen 80;
    server_name your-domain.com;  # 実際のドメイン名に変更
    
    # 静的ファイルの配信
    location / {
        root /path/to/pet-care-tracker/client/dist;  # 実際のパスに変更
        try_files $uri $uri/ /index.html;
        
        # キャッシュ設定
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # API リクエストのプロキシ
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # gzip圧縮
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;
}
```

### HTTPS設定（SSL/TLS）

Let's Encryptを使用したSSL証明書の設定：

```bash
# Certbotのインストール
sudo apt install certbot python3-certbot-nginx

# SSL証明書の取得と自動設定
sudo certbot --nginx -d your-domain.com
```

SSL設定後のnginx設定例：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # SSL設定
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # 静的ファイルの配信
    location / {
        root /path/to/pet-care-tracker/client/dist;
        try_files $uri $uri/ /index.html;
        
        # セキュリティヘッダー
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
        
        # キャッシュ設定
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # API リクエストのプロキシ
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # gzip圧縮
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;
}
```

### nginx設定の有効化

```bash
# 設定ファイルのシンボリックリンクを作成
sudo ln -s /etc/nginx/sites-available/pet-care-tracker /etc/nginx/sites-enabled/

# nginx設定のテスト
sudo nginx -t

# nginxの再起動
sudo systemctl restart nginx

# nginxの自動起動設定
sudo systemctl enable nginx
```

### アプリケーションの起動設定

systemdサービスファイルを作成して、アプリケーションを自動起動：

`/etc/systemd/system/pet-care-tracker.service`：

```ini
[Unit]
Description=Pet Care Tracker Application
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/pet-care-tracker
Environment=NODE_ENV=production
Environment=PORT=3001
ExecStart=/usr/bin/node server/dist/index.js
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

サービスの有効化：

```bash
# サービスファイルの再読み込み
sudo systemctl daemon-reload

# サービスの有効化と起動
sudo systemctl enable pet-care-tracker
sudo systemctl start pet-care-tracker

# サービス状態の確認
sudo systemctl status pet-care-tracker
```

### デプロイ手順

1. **アプリケーションのビルド**：
   ```bash
   cd /path/to/pet-care-tracker
   npm run build
   ```

2. **nginx設定の更新**：
   - 上記の設定ファイルを作成
   - ドメイン名とパスを実際の値に変更

3. **サービスの起動**：
   ```bash
   sudo systemctl start pet-care-tracker
   sudo systemctl restart nginx
   ```

### nginx設定のトラブルシューティング

#### 設定テスト

```bash
# nginx設定の構文チェック
sudo nginx -t

# nginx設定の詳細テスト
sudo nginx -T
```

#### ログの確認

```bash
# nginxエラーログ
sudo tail -f /var/log/nginx/error.log

# nginxアクセスログ
sudo tail -f /var/log/nginx/access.log

# アプリケーションログ
sudo journalctl -u pet-care-tracker -f
```

#### よくある問題と解決方法

**502 Bad Gateway エラー**：
- アプリケーションが起動していない
- ポート3001でリッスンしていない

```bash
# アプリケーション状態確認
sudo systemctl status pet-care-tracker

# ポート確認
sudo netstat -tlnp | grep :3001
```

**403 Forbidden エラー**：
- ファイルの権限問題
- nginxユーザーがファイルにアクセスできない

```bash
# ファイル権限の確認と修正
sudo chown -R www-data:www-data /path/to/pet-care-tracker/client/dist
sudo chmod -R 755 /path/to/pet-care-tracker/client/dist
```

**静的ファイルが見つからない**：
- ビルドが完了していない
- パスが間違っている

```bash
# ビルドディレクトリの確認
ls -la /path/to/pet-care-tracker/client/dist/

# 必要に応じて再ビルド
cd /path/to/pet-care-tracker
npm run build
```

## サポート

問題が発生した場合は、以下の情報を含めてお問い合わせください：

1. エラーメッセージ
2. 実行環境（OS、Node.js バージョン）
3. 実行したコマンド
4. ログファイルの内容
