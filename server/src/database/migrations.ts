import { Database } from './connection';

export const runMigrations = async (db: Database): Promise<void> => {
  // 餌の種類テーブル
  await db.run(`
    CREATE TABLE IF NOT EXISTS feed_types (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      manufacturer VARCHAR(100) NOT NULL,
      product_name VARCHAR(100) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ペット個体テーブル
  await db.run(`
    CREATE TABLE IF NOT EXISTS pets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(50) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 餌やりスケジュールテーブル
  await db.run(`
    CREATE TABLE IF NOT EXISTS feeding_schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      time TIME NOT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 餌やり記録テーブル
  await db.run(`
    CREATE TABLE IF NOT EXISTS feeding_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      feed_type_id INTEGER NOT NULL,
      feeding_time DATETIME NOT NULL,
      consumed BOOLEAN NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (feed_type_id) REFERENCES feed_types(id)
    )
  `);

  // 体重記録テーブル
  await db.run(`
    CREATE TABLE IF NOT EXISTS weight_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pet_id INTEGER NOT NULL,
      weight DECIMAL(5,2) NOT NULL,
      measured_date DATE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (pet_id) REFERENCES pets(id)
    )
  `);

  // メンテナンス記録テーブル
  // 既存のテーブルをチェック
  const tableInfo = await db.all(`PRAGMA table_info(maintenance_records)`);
  
  if (tableInfo.length > 0) {
    // テーブルが存在する場合、CHECK制約を更新するために再作成
    // まず、既存のデータを一時テーブルに保存
    await db.run(`
      CREATE TABLE IF NOT EXISTS maintenance_records_temp (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type VARCHAR(20) NOT NULL CHECK (type IN ('water_filter', 'litter_box', 'nail_clipping')),
        performed_at DATETIME NOT NULL,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 既存のデータをコピー
    await db.run(`
      INSERT INTO maintenance_records_temp (id, type, performed_at, notes, created_at)
      SELECT id, type, performed_at, notes, created_at FROM maintenance_records
    `);
    
    // 古いテーブルを削除
    await db.run(`DROP TABLE maintenance_records`);
    
    // 新しいテーブルをリネーム
    await db.run(`ALTER TABLE maintenance_records_temp RENAME TO maintenance_records`);
  } else {
    // テーブルが存在しない場合は新規作成
    await db.run(`
      CREATE TABLE maintenance_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type VARCHAR(20) NOT NULL CHECK (type IN ('water_filter', 'litter_box', 'nail_clipping')),
        performed_at DATETIME NOT NULL,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  // インデックスの作成
  await db.run(`CREATE INDEX IF NOT EXISTS idx_feeding_records_time ON feeding_records(feeding_time)`);
  await db.run(`CREATE INDEX IF NOT EXISTS idx_weight_records_date ON weight_records(measured_date)`);
  await db.run(`CREATE INDEX IF NOT EXISTS idx_maintenance_records_date ON maintenance_records(performed_at)`);
};