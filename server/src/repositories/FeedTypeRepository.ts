import { BaseRepository } from './BaseRepository';
import { FeedType } from '../types';
import { Database } from '../database/connection';

export class FeedTypeRepository extends BaseRepository {
  constructor(db: Database) {
    super(db);
  }

  async getAllFeedTypes(): Promise<FeedType[]> {
    const rows = await this.db.all<any>(
      'SELECT id, manufacturer, product_name as productName, created_at as createdAt FROM feed_types ORDER BY manufacturer, product_name'
    );
    return rows.map(row => ({
      ...row,
      createdAt: new Date(row.createdAt)
    }));
  }

  async getFeedTypeById(id: number): Promise<FeedType | undefined> {
    const row = await this.db.get<any>(
      'SELECT id, manufacturer, product_name as productName, created_at as createdAt FROM feed_types WHERE id = ?',
      [id]
    );
    if (!row) return undefined;
    return {
      ...row,
      createdAt: new Date(row.createdAt)
    };
  }

  async createFeedType(manufacturer: string, productName: string): Promise<number> {
    const result = await this.db.run(
      'INSERT INTO feed_types (manufacturer, product_name) VALUES (?, ?)',
      [manufacturer, productName]
    );
    return result.lastID!;
  }
}