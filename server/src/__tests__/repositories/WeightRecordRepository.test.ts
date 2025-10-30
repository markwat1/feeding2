import { WeightRecordRepository } from '../../repositories/WeightRecordRepository';
import { PetRepository } from '../../repositories/PetRepository';
import { setupTestDatabase, cleanupTestDatabase } from '../../test/setup';
import { Database } from '../../database/connection';

describe('WeightRecordRepository', () => {
  let db: Database;
  let repository: WeightRecordRepository;
  let petRepo: PetRepository;
  let petId: number;

  beforeEach(async () => {
    db = await setupTestDatabase();
    repository = new WeightRecordRepository(db);
    petRepo = new PetRepository(db);
    
    // テスト用のペットを作成
    petId = await petRepo.create('テストペット');
  });

  afterEach(async () => {
    await cleanupTestDatabase(db);
  });

  describe('create', () => {
    it('should create a new weight record', async () => {
      const measuredDate = new Date('2023-12-01');
      const id = await repository.create(petId, 5.25, measuredDate);
      expect(id).toBeGreaterThan(0);
    });
  });

  describe('findByPetId', () => {
    it('should return empty array when no records exist', async () => {
      const records = await repository.findByPetId(petId);
      expect(records).toEqual([]);
    });

    it('should return all records for a pet ordered by date desc', async () => {
      const date1 = new Date('2023-12-01');
      const date2 = new Date('2023-12-02');
      const date3 = new Date('2023-12-03');
      
      await repository.create(petId, 5.0, date1);
      await repository.create(petId, 5.1, date3);
      await repository.create(petId, 5.05, date2);

      const records = await repository.findByPetId(petId);
      expect(records).toHaveLength(3);
      expect(records[0].measuredDate).toEqual(date3);
      expect(records[1].measuredDate).toEqual(date2);
      expect(records[2].measuredDate).toEqual(date1);
    });

    it('should include pet information in records', async () => {
      const measuredDate = new Date('2023-12-01');
      await repository.create(petId, 5.25, measuredDate);

      const records = await repository.findByPetId(petId);
      expect(records[0].pet).toBeDefined();
      expect(records[0].pet!.name).toBe('テストペット');
      expect(records[0].weight).toBe(5.25);
    });
  });

  describe('findLatestByPetId', () => {
    it('should return undefined when no records exist', async () => {
      const record = await repository.findLatestByPetId(petId);
      expect(record).toBeUndefined();
    });

    it('should return latest record for a pet', async () => {
      const date1 = new Date('2023-12-01');
      const date2 = new Date('2023-12-02');
      
      await repository.create(petId, 5.0, date1);
      await repository.create(petId, 5.1, date2);

      const record = await repository.findLatestByPetId(petId);
      expect(record).toBeDefined();
      expect(record!.weight).toBe(5.1);
      expect(record!.measuredDate).toEqual(date2);
    });
  });

  describe('findByDateRange', () => {
    it('should return records within date range', async () => {
      const date1 = new Date('2023-12-01');
      const date2 = new Date('2023-12-02');
      const date3 = new Date('2023-12-03');
      
      await repository.create(petId, 5.0, date1);
      await repository.create(petId, 5.1, date2);
      await repository.create(petId, 5.2, date3);
      
      const startDate = new Date('2023-12-01');
      const endDate = new Date('2023-12-02');
      
      const records = await repository.findByDateRange(startDate, endDate);
      expect(records).toHaveLength(2);
      expect(records.some(r => r.weight === 5.0)).toBe(true);
      expect(records.some(r => r.weight === 5.1)).toBe(true);
      expect(records.some(r => r.weight === 5.2)).toBe(false);
    });
  });
});