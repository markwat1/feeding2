import { Database } from '../database/connection';

export abstract class BaseRepository {
  protected db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  protected async findById<T>(table: string, id: number): Promise<T | undefined> {
    return this.db.get<T>(`SELECT * FROM ${table} WHERE id = ?`, [id]);
  }

  protected async findAll<T>(table: string, orderBy?: string): Promise<T[]> {
    const sql = `SELECT * FROM ${table}${orderBy ? ` ORDER BY ${orderBy}` : ''}`;
    return this.db.all<T>(sql);
  }

  protected async create(table: string, data: Record<string, any>): Promise<number> {
    const columns = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map(() => '?').join(', ');
    const values = Object.values(data);

    const result = await this.db.run(
      `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`,
      values
    );

    return result.lastID!;
  }

  protected async update(table: string, id: number, data: Record<string, any>): Promise<void> {
    const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(data), id];

    await this.db.run(
      `UPDATE ${table} SET ${setClause} WHERE id = ?`,
      values
    );
  }

  protected async delete(table: string, id: number): Promise<void> {
    await this.db.run(`DELETE FROM ${table} WHERE id = ?`, [id]);
  }
}