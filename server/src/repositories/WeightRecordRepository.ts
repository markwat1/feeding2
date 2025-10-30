import { BaseRepository } from './BaseRepository';
import { WeightRecord } from '../types';
import { Database } from '../database/connection';

export class WeightRecordRepository extends BaseRepository {
  constructor(db: Database) {
    super(db);
  }

  async findByPetId(petId: number): Promise<WeightRecord[]> {
    const rows = await this.db.all<any>(`
      SELECT 
        wr.id,
        wr.pet_id as petId,
        wr.weight,
        wr.measured_date as measuredDate,
        wr.created_at as createdAt,
        p.name as petName
      FROM weight_records wr
      LEFT JOIN pets p ON wr.pet_id = p.id
      WHERE wr.pet_id = ?
      ORDER BY wr.measured_date DESC
    `, [petId]);
    
    return rows.map(row => ({
      id: row.id,
      petId: row.petId,
      weight: parseFloat(row.weight),
      measuredDate: new Date(row.measuredDate),
      createdAt: new Date(row.createdAt),
      pet: row.petName ? {
        id: row.petId,
        name: row.petName,
        createdAt: new Date(row.createdAt)
      } : undefined
    }));
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<WeightRecord[]> {
    const rows = await this.db.all<any>(`
      SELECT 
        wr.id,
        wr.pet_id as petId,
        wr.weight,
        wr.measured_date as measuredDate,
        wr.created_at as createdAt,
        p.name as petName
      FROM weight_records wr
      LEFT JOIN pets p ON wr.pet_id = p.id
      WHERE DATE(wr.measured_date) BETWEEN DATE(?) AND DATE(?)
      ORDER BY wr.measured_date DESC
    `, [startDate.toISOString(), endDate.toISOString()]);
    
    return rows.map(row => ({
      id: row.id,
      petId: row.petId,
      weight: parseFloat(row.weight),
      measuredDate: new Date(row.measuredDate),
      createdAt: new Date(row.createdAt),
      pet: row.petName ? {
        id: row.petId,
        name: row.petName,
        createdAt: new Date(row.createdAt)
      } : undefined
    }));
  }

  async createWeightRecord(petId: number, weight: number, measuredDate: Date): Promise<number> {
    const result = await this.db.run(
      'INSERT INTO weight_records (pet_id, weight, measured_date) VALUES (?, ?, ?)',
      [petId, weight, measuredDate.toISOString().split('T')[0]]
    );
    return result.lastID!;
  }

  async findLatestByPetId(petId: number): Promise<WeightRecord | undefined> {
    const row = await this.db.get<any>(`
      SELECT 
        wr.id,
        wr.pet_id as petId,
        wr.weight,
        wr.measured_date as measuredDate,
        wr.created_at as createdAt,
        p.name as petName
      FROM weight_records wr
      LEFT JOIN pets p ON wr.pet_id = p.id
      WHERE wr.pet_id = ?
      ORDER BY wr.measured_date DESC
      LIMIT 1
    `, [petId]);
    
    if (!row) return undefined;
    
    return {
      id: row.id,
      petId: row.petId,
      weight: parseFloat(row.weight),
      measuredDate: new Date(row.measuredDate),
      createdAt: new Date(row.createdAt),
      pet: row.petName ? {
        id: row.petId,
        name: row.petName,
        createdAt: new Date(row.createdAt)
      } : undefined
    };
  }

  async deleteByPetId(petId: number): Promise<void> {
    await this.db.run(
      'DELETE FROM weight_records WHERE pet_id = ?',
      [petId]
    );
  }
}