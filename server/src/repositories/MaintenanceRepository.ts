import { BaseRepository } from './BaseRepository';
import { MaintenanceRecord } from '../types';
import { Database } from '../database/connection';

export class MaintenanceRepository extends BaseRepository {
  constructor(db: Database) {
    super(db);
  }

  async getAllRecords(): Promise<MaintenanceRecord[]> {
    const rows = await this.db.all<any>(
      'SELECT id, type, performed_at as performedAt, notes, created_at as createdAt FROM maintenance_records ORDER BY performed_at DESC'
    );
    return rows.map(row => ({
      ...row,
      performedAt: new Date(row.performedAt),
      createdAt: new Date(row.createdAt)
    }));
  }

  async getRecordsByType(type: 'water_filter' | 'litter_box'): Promise<MaintenanceRecord[]> {
    const rows = await this.db.all<any>(
      'SELECT id, type, performed_at as performedAt, notes, created_at as createdAt FROM maintenance_records WHERE type = ? ORDER BY performed_at DESC',
      [type]
    );
    return rows.map(row => ({
      ...row,
      performedAt: new Date(row.performedAt),
      createdAt: new Date(row.createdAt)
    }));
  }

  async createRecord(type: 'water_filter' | 'litter_box', performedAt: Date, notes?: string): Promise<number> {
    const result = await this.db.run(
      'INSERT INTO maintenance_records (type, performed_at, notes) VALUES (?, ?, ?)',
      [type, performedAt.toISOString(), notes || null]
    );
    return result.lastID!;
  }

  async updateRecord(id: number, type: 'water_filter' | 'litter_box', performedAt: Date, notes?: string): Promise<void> {
    await this.db.run(
      'UPDATE maintenance_records SET type = ?, performed_at = ?, notes = ? WHERE id = ?',
      [type, performedAt.toISOString(), notes || null, id]
    );
  }

  async deleteRecord(id: number): Promise<void> {
    await this.db.run(
      'DELETE FROM maintenance_records WHERE id = ?',
      [id]
    );
  }

  async getRecordById(id: number): Promise<MaintenanceRecord | undefined> {
    const row = await this.db.get<any>(
      'SELECT id, type, performed_at as performedAt, notes, created_at as createdAt FROM maintenance_records WHERE id = ?',
      [id]
    );
    if (!row) return undefined;
    return {
      ...row,
      performedAt: new Date(row.performedAt),
      createdAt: new Date(row.createdAt)
    };
  }
}