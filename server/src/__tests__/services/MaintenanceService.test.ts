import { MaintenanceService } from '../../services/MaintenanceService';
import { MaintenanceRepository } from '../../repositories/MaintenanceRepository';
import { setupTestDatabase, cleanupTestDatabase } from '../../test/setup';
import { Database } from '../../database/connection';
import { AppError } from '../../middleware/errorHandler';

describe('MaintenanceService', () => {
  let db: Database;
  let service: MaintenanceService;
  let repository: MaintenanceRepository;

  beforeEach(async () => {
    db = await setupTestDatabase();
    repository = new MaintenanceRepository(db);
    service = new MaintenanceService(repository);
  });

  afterEach(async () => {
    await cleanupTestDatabase(db);
  });

  describe('createWaterFilterRecord', () => {
    it('should create a water filter maintenance record', async () => {
      const performedAt = new Date('2023-12-01T10:00:00Z');
      const record = await service.createWaterFilterRecord(performedAt, 'フィルター交換完了');
      
      expect(record.type).toBe('water_filter');
      expect(record.performedAt).toEqual(performedAt);
      expect(record.notes).toBe('フィルター交換完了');
    });

    it('should throw error for future date', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      
      await expect(service.createWaterFilterRecord(futureDate))
        .rejects.toThrow(AppError);
    });
  });

  describe('createLitterBoxRecord', () => {
    it('should create a litter box maintenance record', async () => {
      const performedAt = new Date('2023-12-01T10:00:00Z');
      const record = await service.createLitterBoxRecord(performedAt, '砂交換完了');
      
      expect(record.type).toBe('litter_box');
      expect(record.performedAt).toEqual(performedAt);
      expect(record.notes).toBe('砂交換完了');
    });
  });

  describe('createNailClippingRecord', () => {
    it('should create a nail clipping maintenance record', async () => {
      const performedAt = new Date('2023-12-01T10:00:00Z');
      const record = await service.createNailClippingRecord(performedAt, '爪切り完了');
      
      expect(record.type).toBe('nail_clipping');
      expect(record.performedAt).toEqual(performedAt);
      expect(record.notes).toBe('爪切り完了');
    });

    it('should throw error for future date', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      
      await expect(service.createNailClippingRecord(futureDate))
        .rejects.toThrow(AppError);
    });
  });

  describe('getAllRecords', () => {
    it('should return all maintenance records', async () => {
      const date1 = new Date('2023-12-01T10:00:00Z');
      const date2 = new Date('2023-12-02T10:00:00Z');
      const date3 = new Date('2023-12-03T10:00:00Z');
      
      await service.createWaterFilterRecord(date1);
      await service.createLitterBoxRecord(date2);
      await service.createNailClippingRecord(date3);
      
      const records = await service.getAllRecords();
      expect(records).toHaveLength(3);
    });
  });

  describe('getRecordsByType', () => {
    it('should return records filtered by type', async () => {
      const date1 = new Date('2023-12-01T10:00:00Z');
      const date2 = new Date('2023-12-02T10:00:00Z');
      const date3 = new Date('2023-12-03T10:00:00Z');
      
      await service.createWaterFilterRecord(date1);
      await service.createLitterBoxRecord(date2);
      await service.createNailClippingRecord(date3);
      
      const waterFilterRecords = await service.getRecordsByType('water_filter');
      expect(waterFilterRecords).toHaveLength(1);
      expect(waterFilterRecords[0].type).toBe('water_filter');
      
      const litterBoxRecords = await service.getRecordsByType('litter_box');
      expect(litterBoxRecords).toHaveLength(1);
      expect(litterBoxRecords[0].type).toBe('litter_box');
      
      const nailClippingRecords = await service.getRecordsByType('nail_clipping');
      expect(nailClippingRecords).toHaveLength(1);
      expect(nailClippingRecords[0].type).toBe('nail_clipping');
    });
  });
});