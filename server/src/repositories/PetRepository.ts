import { BaseRepository } from './BaseRepository';
import { Pet } from '../types';
import { Database } from '../database/connection';

export class PetRepository extends BaseRepository {
  constructor(db: Database) {
    super(db);
  }

  async getAllPets(): Promise<Pet[]> {
    const rows = await this.db.all<any>(
      'SELECT id, name, created_at as createdAt FROM pets ORDER BY name'
    );
    return rows.map(row => ({
      ...row,
      createdAt: new Date(row.createdAt)
    }));
  }

  async getPetById(id: number): Promise<Pet | undefined> {
    const row = await this.db.get<any>(
      'SELECT id, name, created_at as createdAt FROM pets WHERE id = ?',
      [id]
    );
    if (!row) return undefined;
    return {
      ...row,
      createdAt: new Date(row.createdAt)
    };
  }

  async createPet(name: string): Promise<number> {
    const result = await this.db.run(
      'INSERT INTO pets (name) VALUES (?)',
      [name]
    );
    return result.lastID!;
  }

  async updatePet(id: number, name: string): Promise<void> {
    await this.db.run(
      'UPDATE pets SET name = ? WHERE id = ?',
      [name, id]
    );
  }

  async deletePet(id: number): Promise<void> {
    await this.db.run(
      'DELETE FROM pets WHERE id = ?',
      [id]
    );
  }
}