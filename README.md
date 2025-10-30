# ペット管理システム

ペットの餌やり、体重測定、メンテナンス作業を記録・管理する Web アプリケーションです。

## 機能

### 餌やり管理

- 餌の種類の登録（メーカー名、商品名）
- 餌やりスケジュールの設定
- 餌やり記録の作成
- 摂食状況の記録（食べきった/残した）
- 前回の未記録摂食状況の確認・記録

### ペット管理

- ペット個体の登録・管理
- 体重記録（kg 単位、小数点以下 2 桁まで）
- 体重履歴の表示

### カレンダー表示

- 月間カレンダー形式での記録表示
- 餌やり記録の色分け表示（緑：完食、黄：残食）
- 体重記録の表示
- メンテナンス記録の表示

### メンテナンス管理

- 給水器フィルター交換記録
- トイレ砂交換記録
- メンテナンス履歴の表示

## 技術スタック

### フロントエンド

- React 18
- TypeScript
- Vite
- CSS Modules
- React Router DOM
- Axios
- date-fns

### バックエンド

- Node.js
- Express.js
- TypeScript
- SQLite3
- date-fns

### テスト

- Jest (バックエンド)
- Vitest (フロントエンド)
- React Testing Library
- Supertest

## インストール方法

### 前提条件

- Node.js 18 以上
- npm

### セットアップ

1. リポジトリをクローン

```bash
git clone <repository-url>
cd pet-care-tracker
```

2. 依存関係をインストール

```bash
npm run install:all
```

これにより、ルート、サーバー、クライアントの全ての依存関係がインストールされます。

### 開発環境での起動

1. 開発サーバーを起動（フロントエンドとバックエンドを同時起動）

```bash
npm run dev
```

2. 個別に起動する場合：

バックエンドのみ：

```bash
npm run server:dev
```

フロントエンドのみ：

```bash
npm run client:dev
```

### アクセス

- フロントエンド: http://localhost:3000
- バックエンド API: http://localhost:3001

## 本番環境での起動

1. アプリケーションをビルド

```bash
npm run build
```

2. 本番サーバーを起動

```bash
npm start
```

## テスト実行

全てのテストを実行：

```bash
npm test
```

個別にテストを実行：

```bash
# バックエンドテスト
npm run server:test

# フロントエンドテスト
npm run client:test
```

## API エンドポイント

### 餌の種類

- `GET /api/feeds` - 餌の種類一覧取得
- `POST /api/feeds` - 餌の種類登録

### 餌やりスケジュール

- `GET /api/feeding-schedules` - スケジュール一覧取得
- `POST /api/feeding-schedules` - スケジュール登録
- `PUT /api/feeding-schedules/:id` - スケジュール時刻更新
- `DELETE /api/feeding-schedules/:id` - スケジュール削除
- `PATCH /api/feeding-schedules/:id/toggle` - 有効/無効切り替え
- `GET /api/feeding-schedules/next` - 次のスケジュール時刻取得

### 餌やり記録

- `GET /api/feeding-records` - 餌やり記録取得
- `POST /api/feeding-records` - 餌やり記録作成
- `PUT /api/feeding-records/:id` - 摂食状況更新
- `PATCH /api/feeding-records/:id` - 餌やり記録更新
- `DELETE /api/feeding-records/:id` - 餌やり記録削除
- `GET /api/feeding-records/latest-unconsumed` - 未記録の最新記録取得

### ペット管理

- `GET /api/pets` - ペット一覧取得
- `POST /api/pets` - ペット登録
- `GET /api/pets/:id` - ペット詳細取得
- `PUT /api/pets/:id` - ペット情報更新
- `DELETE /api/pets/:id` - ペット削除

### 体重記録

- `GET /api/pets/:id/weights` - ペットの体重記録取得
- `POST /api/pets/:id/weights` - 体重記録作成
- `GET /api/pets/:id/weights/latest` - 最新体重記録取得
- `GET /api/weight-records` - 日付範囲での体重記録取得

### メンテナンス

- `GET /api/maintenance` - メンテナンス記録取得
- `POST /api/maintenance/water-filter` - 給水器フィルター交換記録
- `POST /api/maintenance/litter-box` - トイレ砂交換記録
- `PUT /api/maintenance/:id` - メンテナンス記録更新
- `DELETE /api/maintenance/:id` - メンテナンス記録削除

## データベース

SQLite データベースを使用しています。初回起動時に自動的にテーブルが作成されます。

データベースファイル: `server/data/pet_care.db`

## プロジェクト構造

```
pet-care-tracker/
├── client/                 # フロントエンド（React）
│   ├── src/
│   │   ├── components/     # Reactコンポーネント
│   │   ├── services/       # API通信
│   │   ├── types/          # TypeScript型定義
│   │   └── test/           # テスト設定
│   └── package.json
├── server/                 # バックエンド（Express）
│   ├── src/
│   │   ├── controllers/    # APIコントローラー
│   │   ├── services/       # ビジネスロジック
│   │   ├── repositories/   # データアクセス層
│   │   ├── database/       # データベース設定
│   │   ├── middleware/     # Express ミドルウェア
│   │   ├── routes/         # APIルート
│   │   ├── types/          # TypeScript型定義
│   │   └── __tests__/      # テストファイル
│   └── package.json
└── package.json            # ルートpackage.json
```

## 開発ガイドライン

### コーディング規約

- TypeScript を使用
- ESLint と Prettier によるコード整形
- 関数型コンポーネントを使用（React）
- CSS Modules によるスタイリング

### テスト

- 単体テスト、統合テストを実装
- テストカバレッジを重視
- API エンドポイントのテストを含む

## トラブルシューティング

### よくある問題

1. **ポートが使用中のエラー**

   - 他のアプリケーションがポート 3000 または 3001 を使用している可能性があります
   - プロセスを終了するか、別のポートを使用してください

2. **データベース接続エラー**

   - `server/data/`ディレクトリが存在することを確認してください
   - 権限の問題がないか確認してください

3. **依存関係のエラー**
   - `npm run install:all`を再実行してください
   - Node.js のバージョンが 18 以上であることを確認してください

## ライセンス

MIT License
