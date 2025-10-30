import express from 'express';
import cors from 'cors';
import path from 'path';
import { initializeDatabase } from './database/init';
import { errorHandler } from './middleware/errorHandler';
import feedingRoutes from './routes/feeding';
import petRoutes from './routes/pets';
import maintenanceRoutes from './routes/maintenance';

const app = express();
const PORT = process.env.PORT || 3001;

// ミドルウェア
app.use(cors());
app.use(express.json());

// 本番環境では静的ファイルを配信
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/dist')));
}

// ヘルスチェックエンドポイント
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ルート
app.use('/api', feedingRoutes);
app.use('/api', petRoutes);
app.use('/api', maintenanceRoutes);

// エラーハンドリングミドルウェア
app.use(errorHandler);

// 本番環境では全てのルートでReactアプリを返す（SPA対応）
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
  });
}

// サーバー起動
const startServer = async (): Promise<void> => {
  try {
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();