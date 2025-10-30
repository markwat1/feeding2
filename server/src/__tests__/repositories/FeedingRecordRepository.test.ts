import { FeedingRecordRepository } from '../../repositories/FeedingRecordRepository';
import { FeedTypeRepository } from '../../repositories/FeedTypeRepository';
import { setupTestDatabase, cleanupTestDatabase } from '../../test/setup';
import { Database } from '../../database/connection';

describe('FeedingRecordRepository', () => {
  let db: Database;
  let repository: FeedingRecordRepository;
  let feedTypeRepo: FeedTypeRepository;
  let feedTypeId: number;

  beforeEach(async () => {
    db = await setupTestDatabase();
    repository = new FeedingRecordRepository(db);
    feedTypeRepo = new FeedTypeRepository(db);
    
    // テスト用の餌の種類を作成
    feedTypeId = await feedTypeRepo.createFeedType('テストメーカー', 'テスト商品');
  });

  afterEach(async () => {
    await cleanupTestDatabase(db);
  });

  describe('create', () => {
    it('should create a new feeding record', async () => {
      const feedingTime = new Date('2023-12-01T08:00:00Z');
      const id = await repository.create(feedTypeId, feedingTime);
      expect(id).toBeGreaterThan(0);
    });
  });

  describe('findAll', () => {
    it('should return empty array when no records exist', async () => {
      const records = await repository.findAll();
      expect(records).toEqual([]);
    });

    it('should return all records with feed type information', async () => {
      const feedingTime = new Date('2023-12-01T08:00:00Z');
      await repository.create(feedTypeId, feedingTime);

      const records = await repository.findAll();
      expect(records).toHaveLength(1);
      expect(records[0].feedTypeId).toBe(feedTypeId);
      expect(records[0].feedingTime).toEqual(feedingTime);
      expect(records[0].consumed).toBeNull();
      expect(records[0].feedType).toBeDefined();
      expect(records[0].feedType!.manufacturer).toBe('テストメーカー');
    });
  });

  describe('updateConsumption', () => {
    it('should update consumption status', async () => {
      const feedingTime = new Date('2023-12-01T08:00:00Z');
      const id = await repository.create(feedTypeId, feedingTime);
      
      await repository.updateConsumption(id, true);
      
      const records = await repository.findAll();
      expect(records[0].consumed).toBe(true);
    });
  });

  describe('findLatestWithoutConsumption', () => {
    it('should return undefined when no unconsumed records exist', async () => {
      const record = await repository.findLatestWithoutConsumption();
      expect(record).toBeUndefined();
    });

    it('should return latest record without consumption data', async () => {
      const time1 = new Date('2023-12-01T08:00:00Z');
      const time2 = new Date('2023-12-01T12:00:00Z');
      
      const id1 = await repository.create(feedTypeId, time1);
      const id2 = await repository.create(feedTypeId, time2);
      
      // 最初の記録の摂食状況を更新
      await repository.updateConsumption(id1, true);
      
      const record = await repository.findLatestWithoutConsumption();
      expect(record).toBeDefined();
      expect(record!.id).toBe(id2);
      expect(record!.consumed).toBeNull();
    });
  });

  describe('findByDateRange', () => {
    it('should return records within date range', async () => {
      const date1 = new Date('2023-12-01T08:00:00Z');
      const date2 = new Date('2023-12-02T08:00:00Z');
      const date3 = new Date('2023-12-03T08:00:00Z');
      
      await repository.create(feedTypeId, date1);
      await repository.create(feedTypeId, date2);
      await repository.create(feedTypeId, date3);
      
      const startDate = new Date('2023-12-01');
      const endDate = new Date('2023-12-02');
      
      const records = await repository.findByDateRange(startDate, endDate);
      expect(records).toHaveLength(2);
    });
  });
});