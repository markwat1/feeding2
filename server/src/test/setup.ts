import { Database } from '../database/connection';
import { runMigrations } from '../database/migrations';

// テスト用のインメモリデータベースセットアップ
export const setupTestDatabase = async (): Promise<Database> => {
  const testDb = new Database(':memory:');
  await runMigrations(testDb);
  return testDb;
};

// テストデータベースのクリーンアップ
export const cleanupTestDatabase = async (db: Database): Promise<void> => {
  await db.close();
};