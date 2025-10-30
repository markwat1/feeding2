import { BaseRepository } from './BaseRepository';
import { FeedingSchedule } from '../types';
import { Database } from '../database/connection';

export class FeedingScheduleRepository extends BaseRepository {
  constructor(db: Database) {
    super(db);
  }

  async getAllSchedules(): Promise<FeedingSchedule[]> {
    const rows = await this.db.all<any>(
      'SELECT id, time, is_active as isActive, created_at as createdAt FROM feeding_schedules ORDER BY time'
    );
    return rows.map(row => ({
      ...row,
      isActive: Boolean(row.isActive),
      createdAt: new Date(row.createdAt)
    }));
  }

  async getActiveSchedules(): Promise<FeedingSchedule[]> {
    const rows = await this.db.all<any>(
      'SELECT id, time, is_active as isActive, created_at as createdAt FROM feeding_schedules WHERE is_active = 1 ORDER BY time'
    );
    return rows.map(row => ({
      ...row,
      isActive: Boolean(row.isActive),
      createdAt: new Date(row.createdAt)
    }));
  }

  async createSchedule(time: string): Promise<number> {
    const result = await this.db.run(
      'INSERT INTO feeding_schedules (time) VALUES (?)',
      [time]
    );
    return result.lastID!;
  }

  async updateActive(id: number, isActive: boolean): Promise<void> {
    await this.db.run(
      'UPDATE feeding_schedules SET is_active = ? WHERE id = ?',
      [isActive ? 1 : 0, id]
    );
  }

  async updateTime(id: number, time: string): Promise<void> {
    await this.db.run(
      'UPDATE feeding_schedules SET time = ? WHERE id = ?',
      [time, id]
    );
  }

  async deleteSchedule(id: number): Promise<void> {
    await this.db.run(
      'DELETE FROM feeding_schedules WHERE id = ?',
      [id]
    );
  }

  async getScheduleById(id: number): Promise<FeedingSchedule | undefined> {
    const row = await this.db.get<any>(
      'SELECT id, time, is_active as isActive, created_at as createdAt FROM feeding_schedules WHERE id = ?',
      [id]
    );
    if (!row) return undefined;
    return {
      ...row,
      isActive: Boolean(row.isActive),
      createdAt: new Date(row.createdAt)
    };
  }
}