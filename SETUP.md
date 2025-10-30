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

- フロントエンド: http://localhost:3000
- バックエンド API: http://localhost:3001
- ヘルスチェック: http://localhost:3001/api/health

## 本番環境での起動

### 1. ビルド

```bash
npm run build
```

### 2. 本番サーバー起動

```bash
npm start
```

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

## サポート

問題が発生した場合は、以下の情報を含めてお問い合わせください：

1. エラーメッセージ
2. 実行環境（OS、Node.js バージョン）
3. 実行したコマンド
4. ログファイルの内容
