import { PetService } from '../../services/PetService';
import { PetRepository } from '../../repositories/PetRepository';
import { WeightRecordRepository } from '../../repositories/WeightRecordRepository';
import { setupTestDatabase, cleanupTestDatabase } from '../../test/setup';
import { Database } from '../../database/connection';
import { AppError } from '../../middleware/errorHandler';

describe('PetService', () => {
  let db: Database;
  let service: PetService;
  let petRepo: PetRepository;
  let weightRepo: WeightRecordRepository;

  beforeEach(async () => {
    db = await setupTestDatabase();
    petRepo = new PetRepository(db);
    weightRepo = new WeightRecordRepository(db);
    service = new PetService(petRepo, weightRepo);
  });

  afterEach(async () => {
    await cleanupTestDatabase(db);
  });

  describe('createPet', () => {
    it('should create a new pet', async () => {
      const pet = await service.createPet('テストペット');
      
      expect(pet.name).toBe('テストペット');
      expect(pet.id).toBeGreaterThan(0);
    });

    it('should throw error for empty name', async () => {
      await expect(service.createPet(''))
        .rejects.toThrow(AppError);
      
      await expect(service.createPet('   '))
        .rejects.toThrow(AppError);
    });

    it('should trim whitespace from name', async () => {
      const pet = await service.createPet('  テストペット  ');
      expect(pet.name).toBe('テストペット');
    });
  });

  describe('getPetById', () => {
    it('should return pet when it exists', async () => {
      const created = await service.createPet('テストペット');
      const pet = await service.getPetById(created.id);
      
      expect(pet.id).toBe(created.id);
      expect(pet.name).toBe('テストペット');
    });

    it('should throw error when pet does not exist', async () => {
      await expect(service.getPetById(999))
        .rejects.toThrow(AppError);
    });
  });

  describe('updatePet', () => {
    it('should update pet name', async () => {
      const created = await service.createPet('元の名前');
      const updated = await service.updatePet(created.id, '新しい名前');
      
      expect(updated.name).toBe('新しい名前');
      expect(updated.id).toBe(created.id);
    });

    it('should throw error for empty name', async () => {
      const created = await service.createPet('テストペット');
      
      await expect(service.updatePet(created.id, ''))
        .rejects.toThrow(AppError);
    });

    it('should throw error for non-existent pet', async () => {
      await expect(service.updatePet(999, '新しい名前'))
        .rejects.toThrow(AppError);
    });
  });

  describe('createWeightRecord', () => {
    let petId: number;

    beforeEach(async () => {
      const pet = await service.createPet('テストペット');
      petId = pet.id;
    });

    it('should create a weight record', async () => {
      const measuredDate = new Date('2023-12-01');
      const record = await service.createWeightRecord(petId, 5.25, measuredDate);
      
      expect(record.petId).toBe(petId);
      expect(record.weight).toBe(5.25);
      expect(record.measuredDate).toEqual(measuredDate);
    });

    it('should throw error for negative weight', async () => {
      const measuredDate = new Date('2023-12-01');
      
      await expect(service.createWeightRecord(petId, -1, measuredDate))
        .rejects.toThrow(AppError);
      
      await expect(service.createWeightRecord(petId, 0, measuredDate))
        .rejects.toThrow(AppError);
    });

    it('should throw error for more than 2 decimal places', async () => {
      const measuredDate = new Date('2023-12-01');
      
      await expect(service.createWeightRecord(petId, 5.123, measuredDate))
        .rejects.toThrow(AppError);
    });

    it('should accept weight with exactly 2 decimal places', async () => {
      const measuredDate = new Date('2023-12-01');
      const record = await service.createWeightRecord(petId, 5.12, measuredDate);
      
      expect(record.weight).toBe(5.12);
    });

    it('should throw error for future date', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      
      await expect(service.createWeightRecord(petId, 5.0, futureDate))
        .rejects.toThrow(AppError);
    });

    it('should accept today\'s date', async () => {
      const today = new Date();
      const record = await service.createWeightRecord(petId, 5.0, today);
      
      expect(record.weight).toBe(5.0);
    });

    it('should throw error for non-existent pet', async () => {
      const measuredDate = new Date('2023-12-01');
      
      await expect(service.createWeightRecord(999, 5.0, measuredDate))
        .rejects.toThrow(AppError);
    });
  });

  describe('getWeightRecords', () => {
    it('should return weight records for a pet', async () => {
      const pet = await service.createPet('テストペット');
      const measuredDate = new Date('2023-12-01');
      
      await service.createWeightRecord(pet.id, 5.25, measuredDate);
      
      const records = await service.getWeightRecords(pet.id);
      expect(records).toHaveLength(1);
      expect(records[0].weight).toBe(5.25);
    });

    it('should throw error for non-existent pet', async () => {
      await expect(service.getWeightRecords(999))
        .rejects.toThrow(AppError);
    });
  });

  describe('getLatestWeightRecord', () => {
    it('should return null when no records exist', async () => {
      const pet = await service.createPet('テストペット');
      const record = await service.getLatestWeightRecord(pet.id);
      
      expect(record).toBeNull();
    });

    it('should return latest weight record', async () => {
      const pet = await service.createPet('テストペット');
      const date1 = new Date('2023-12-01');
      const date2 = new Date('2023-12-02');
      
      await service.createWeightRecord(pet.id, 5.0, date1);
      await service.createWeightRecord(pet.id, 5.1, date2);
      
      const record = await service.getLatestWeightRecord(pet.id);
      expect(record!.weight).toBe(5.1);
      expect(record!.measuredDate).toEqual(date2);
    });
  });
});