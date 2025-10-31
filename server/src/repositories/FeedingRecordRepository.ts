import { BaseRepository } from './BaseRepository';
import { FeedingRecord } from '../types';
import { Database } from '../database/connection';

export class FeedingRecordRepository extends BaseRepository {
  constructor(db: Database) {
    super(db);
  }

  async getAllRecords(): Promise<FeedingRecord[]> {
    const rows = await this.db.all<any>(`
      SELECT 
        fr.id,
        fr.feed_type_id as feedTypeId,
        fr.feeding_time as feedingTime,
        fr.consumed,
        fr.created_at as createdAt,
        ft.manufacturer,
        ft.product_name as productName
      FROM feeding_records fr
      LEFT JOIN feed_types ft ON fr.feed_type_id = ft.id
      ORDER BY fr.feeding_time DESC
    `);
    
    return rows.map(row => ({
      id: row.id,
      feedTypeId: row.feedTypeId,
      feedingTime: new Date(row.feedingTime),
      consumed: row.consumed === null ? null : Boolean(row.consumed),
      createdAt: new Date(row.createdAt),
      feedType: row.manufacturer ? {
        id: row.feedTypeId,
        manufacturer: row.manufacturer,
        productName: row.productName,
        createdAt: new Date(row.createdAt)
      } : undefined
    }));
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<FeedingRecord[]> {
    // 日付範囲を拡張して、タイムゾーンの影響を考慮
    const startOfDay = new Date(startDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(endDate);
    endOfDay.setUTCHours(23, 59, 59, 999);
    
    const rows = await this.db.all<any>(`
      SELECT 
        fr.id,
        fr.feed_type_id as feedTypeId,
        fr.feeding_time as feedingTime,
        fr.consumed,
        fr.created_at as createdAt,
        ft.manufacturer,
        ft.product_name as productName
      FROM feeding_records fr
      LEFT JOIN feed_types ft ON fr.feed_type_id = ft.id
      WHERE fr.feeding_time >= ? AND fr.feeding_time <= ?
      ORDER BY fr.feeding_time DESC
    `, [startOfDay.toISOString(), endOfDay.toISOString()]);
    
    return rows.map(row => ({
      id: row.id,
      feedTypeId: row.feedTypeId,
      feedingTime: new Date(row.feedingTime),
      consumed: row.consumed === null ? null : Boolean(row.consumed),
      createdAt: new Date(row.createdAt),
      feedType: row.manufacturer ? {
        id: row.feedTypeId,
        manufacturer: row.manufacturer,
        productName: row.productName,
        createdAt: new Date(row.createdAt)
      } : undefined
    }));
  }

  async findLatestWithoutConsumption(): Promise<FeedingRecord | undefined> {
    const row = await this.db.get<any>(`
      SELECT 
        fr.id,
        fr.feed_type_id as feedTypeId,
        fr.feeding_time as feedingTime,
        fr.consumed,
        fr.created_at as createdAt,
        ft.manufacturer,
        ft.product_name as productName
      FROM feeding_records fr
      LEFT JOIN feed_types ft ON fr.feed_type_id = ft.id
      WHERE fr.consumed IS NULL
      ORDER BY fr.feeding_time DESC
      LIMIT 1
    `);
    
    if (!row) return undefined;
    
    return {
      id: row.id,
      feedTypeId: row.feedTypeId,
      feedingTime: new Date(row.feedingTime),
      consumed: null,
      createdAt: new Date(row.createdAt),
      feedType: row.manufacturer ? {
        id: row.feedTypeId,
        manufacturer: row.manufacturer,
        productName: row.productName,
        createdAt: new Date(row.createdAt)
      } : undefined
    };
  }

  async createRecord(feedTypeId: number, feedingTime: Date): Promise<number> {
    const result = await this.db.run(
      'INSERT INTO feeding_records (feed_type_id, feeding_time) VALUES (?, ?)',
      [feedTypeId, feedingTime.toISOString()]
    );
    return result.lastID!;
  }

  async updateConsumption(id: number, consumed: boolean): Promise<void> {
    await this.db.run(
      'UPDATE feeding_records SET consumed = ? WHERE id = ?',
      [consumed ? 1 : 0, id]
    );
  }

  async updateRecord(id: number, feedTypeId: number, feedingTime: Date): Promise<void> {
    await this.db.run(
      'UPDATE feeding_records SET feed_type_id = ?, feeding_time = ? WHERE id = ?',
      [feedTypeId, feedingTime.toISOString(), id]
    );
  }

  async deleteRecord(id: number): Promise<void> {
    await this.db.run(
      'DELETE FROM feeding_records WHERE id = ?',
      [id]
    );
  }

  async getRecordById(id: number): Promise<FeedingRecord | undefined> {
    const row = await this.db.get<any>(`
      SELECT 
        fr.id,
        fr.feed_type_id as feedTypeId,
        fr.feeding_time as feedingTime,
        fr.consumed,
        fr.created_at as createdAt,
        ft.manufacturer,
        ft.product_name as productName
      FROM feeding_records fr
      LEFT JOIN feed_types ft ON fr.feed_type_id = ft.id
      WHERE fr.id = ?
    `, [id]);
    
    if (!row) return undefined;
    
    return {
      id: row.id,
      feedTypeId: row.feedTypeId,
      feedingTime: new Date(row.feedingTime),
      consumed: row.consumed === null ? null : Boolean(row.consumed),
      createdAt: new Date(row.createdAt),
      feedType: row.manufacturer ? {
        id: row.feedTypeId,
        manufacturer: row.manufacturer,
        productName: row.productName,
        createdAt: new Date(row.createdAt)
      } : undefined
    };
  }

  async hasRecordForDateTime(date: string, time: string): Promise<boolean> {
    const row = await this.db.get<any>(`
      SELECT COUNT(*) as count
      FROM feeding_records
      WHERE DATE(feeding_time) = ? AND TIME(feeding_time) = ?
    `, [date, time]);
    
    return row.count > 0;
  }
}