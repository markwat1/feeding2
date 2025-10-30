import { getDatabase } from './connection';
import { runMigrations } from './migrations';
import fs from 'fs';
import path from 'path';

export const initializeDatabase = async (): Promise<void> => {
  // データディレクトリが存在しない場合は作成
  const dataDir = path.join(__dirname, '../../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const db = getDatabase();
  await runMigrations(db);
  
  console.log('Database initialized successfully');
};