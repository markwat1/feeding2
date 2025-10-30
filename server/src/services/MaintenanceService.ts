import { MaintenanceRepository } from '../repositories/MaintenanceRepository';
import { MaintenanceRecord } from '../types';
import { AppError } from '../middleware/errorHandler';

export class MaintenanceService {
  constructor(private maintenanceRepo: MaintenanceRepository) {}

  async getAllRecords(): Promise<MaintenanceRecord[]> {
    return this.maintenanceRepo.getAllRecords();
  }

  async getRecordsByType(type: 'water_filter' | 'litter_box'): Promise<MaintenanceRecord[]> {
    return this.maintenanceRepo.getRecordsByType(type);
  }

  async createWaterFilterRecord(performedAt: Date, notes?: string): Promise<MaintenanceRecord> {
    return this.createRecord('water_filter', performedAt, notes);
  }

  async createLitterBoxRecord(performedAt: Date, notes?: string): Promise<MaintenanceRecord> {
    return this.createRecord('litter_box', performedAt, notes);
  }

  private async createRecord(type: 'water_filter' | 'litter_box', performedAt: Date, notes?: string): Promise<MaintenanceRecord> {
    // 実施日が未来でないことを確認
    const now = new Date();
    if (performedAt > now) {
      throw new AppError('Performed date cannot be in the future', 400, 'VALIDATION_ERROR');
    }

    const id = await this.maintenanceRepo.createRecord(type, performedAt, notes);
    const records = await this.maintenanceRepo.getAllRecords();
    const created = records.find(r => r.id === id);
    
    if (!created) {
      throw new AppError('Failed to create maintenance record', 500, 'CREATION_ERROR');
    }

    return created;
  }

  async updateRecord(id: number, type: 'water_filter' | 'litter_box', performedAt: Date, notes?: string): Promise<MaintenanceRecord> {
    // 実施日が未来でないことを確認
    const now = new Date();
    if (performedAt > now) {
      throw new AppError('Performed date cannot be in the future', 400, 'VALIDATION_ERROR');
    }

    // 記録が存在するか確認
    const existingRecord = await this.maintenanceRepo.getRecordById(id);
    if (!existingRecord) {
      throw new AppError('Maintenance record not found', 404, 'NOT_FOUND');
    }

    await this.maintenanceRepo.updateRecord(id, type, performedAt, notes);
    const updatedRecord = await this.maintenanceRepo.getRecordById(id);
    
    if (!updatedRecord) {
      throw new AppError('Failed to update maintenance record', 500, 'UPDATE_ERROR');
    }

    return updatedRecord;
  }

  async deleteRecord(id: number): Promise<void> {
    // 記録が存在するか確認
    const existingRecord = await this.maintenanceRepo.getRecordById(id);
    if (!existingRecord) {
      throw new AppError('Maintenance record not found', 404, 'NOT_FOUND');
    }

    await this.maintenanceRepo.deleteRecord(id);
  }
}