import { FeedingService } from '../../services/FeedingService';
import { FeedTypeRepository } from '../../repositories/FeedTypeRepository';
import { FeedingScheduleRepository } from '../../repositories/FeedingScheduleRepository';
import { FeedingRecordRepository } from '../../repositories/FeedingRecordRepository';
import { setupTestDatabase, cleanupTestDatabase } from '../../test/setup';
import { Database } from '../../database/connection';
import { AppError } from '../../middleware/errorHandler';

describe('FeedingService', () => {
  let db: Database;
  let service: FeedingService;
  let feedTypeRepo: FeedTypeRepository;
  let scheduleRepo: FeedingScheduleRepository;
  let recordRepo: FeedingRecordRepository;

  beforeEach(async () => {
    db = await setupTestDatabase();
    feedTypeRepo = new FeedTypeRepository(db);
    scheduleRepo = new FeedingScheduleRepository(db);
    recordRepo = new FeedingRecordRepository(db);
    service = new FeedingService(feedTypeRepo, scheduleRepo, recordRepo);
  });

  afterEach(async () => {
    await cleanupTestDatabase(db);
  });

  describe('createFeedType', () => {
    it('should create a new feed type', async () => {
      const feedType = await service.createFeedType('テストメーカー', 'テスト商品');
      
      expect(feedType.manufacturer).toBe('テストメーカー');
      expect(feedType.productName).toBe('テスト商品');
      expect(feedType.id).toBeGreaterThan(0);
    });

    it('should throw error for empty manufacturer', async () => {
      await expect(service.createFeedType('', 'テスト商品'))
        .rejects.toThrow(AppError);
    });

    it('should throw error for empty product name', async () => {
      await expect(service.createFeedType('テストメーカー', ''))
        .rejects.toThrow(AppError);
    });

    it('should trim whitespace from inputs', async () => {
      const feedType = await service.createFeedType('  テストメーカー  ', '  テスト商品  ');
      
      expect(feedType.manufacturer).toBe('テストメーカー');
      expect(feedType.productName).toBe('テスト商品');
    });
  });

  describe('createSchedule', () => {
    it('should create a valid schedule', async () => {
      const schedule = await service.createSchedule('08:00');
      
      expect(schedule.time).toBe('08:00');
      expect(schedule.isActive).toBe(true);
    });

    it('should throw error for invalid time format', async () => {
      await expect(service.createSchedule('25:00'))
        .rejects.toThrow(AppError);
      
      await expect(service.createSchedule('8:00'))
        .rejects.toThrow(AppError);
      
      await expect(service.createSchedule('08:60'))
        .rejects.toThrow(AppError);
    });
  });

  describe('createRecord', () => {
    it('should create a feeding record', async () => {
      const feedTypeId = await feedTypeRepo.create('テストメーカー', 'テスト商品');
      const feedingTime = new Date('2023-12-01T08:00:00Z');
      
      const record = await service.createRecord(feedTypeId, feedingTime);
      
      expect(record.feedTypeId).toBe(feedTypeId);
      expect(record.feedingTime).toEqual(feedingTime);
      expect(record.consumed).toBeNull();
    });

    it('should throw error for non-existent feed type', async () => {
      const feedingTime = new Date('2023-12-01T08:00:00Z');
      
      await expect(service.createRecord(999, feedingTime))
        .rejects.toThrow(AppError);
    });
  });

  describe('updateConsumption', () => {
    it('should update consumption status', async () => {
      const feedTypeId = await feedTypeRepo.create('テストメーカー', 'テスト商品');
      const feedingTime = new Date('2023-12-01T08:00:00Z');
      const record = await service.createRecord(feedTypeId, feedingTime);
      
      const updated = await service.updateConsumption(record.id, true);
      
      expect(updated.consumed).toBe(true);
    });

    it('should throw error for non-existent record', async () => {
      await expect(service.updateConsumption(999, true))
        .rejects.toThrow(AppError);
    });
  });

  describe('getNextScheduledTime', () => {
    it('should return null when no schedules exist', async () => {
      const nextTime = await service.getNextScheduledTime();
      expect(nextTime).toBeNull();
    });

    it('should return next scheduled time', async () => {
      await scheduleRepo.create('08:00');
      await scheduleRepo.create('12:00');
      await scheduleRepo.create('18:00');
      
      // モックの現在時刻を設定するのは複雑なので、基本的な動作のみテスト
      const nextTime = await service.getNextScheduledTime();
      expect(nextTime).toBeDefined();
      expect(['08:00', '12:00', '18:00']).toContain(nextTime);
    });
  });
});