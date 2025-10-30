import { PetRepository } from '../../repositories/PetRepository';
import { setupTestDatabase, cleanupTestDatabase } from '../../test/setup';
import { Database } from '../../database/connection';

describe('PetRepository', () => {
  let db: Database;
  let repository: PetRepository;

  beforeEach(async () => {
    db = await setupTestDatabase();
    repository = new PetRepository(db);
  });

  afterEach(async () => {
    await cleanupTestDatabase(db);
  });

  describe('create', () => {
    it('should create a new pet', async () => {
      const id = await repository.create('テストペット');
      expect(id).toBeGreaterThan(0);
    });
  });

  describe('findAll', () => {
    it('should return empty array when no pets exist', async () => {
      const pets = await repository.findAll();
      expect(pets).toEqual([]);
    });

    it('should return all pets ordered by name', async () => {
      await repository.create('ペットC');
      await repository.create('ペットA');
      await repository.create('ペットB');

      const pets = await repository.findAll();
      expect(pets).toHaveLength(3);
      expect(pets[0].name).toBe('ペットA');
      expect(pets[1].name).toBe('ペットB');
      expect(pets[2].name).toBe('ペットC');
    });
  });

  describe('findById', () => {
    it('should return undefined when pet does not exist', async () => {
      const pet = await repository.findById(999);
      expect(pet).toBeUndefined();
    });

    it('should return pet when it exists', async () => {
      const id = await repository.create('テストペット');
      const pet = await repository.findById(id);
      
      expect(pet).toBeDefined();
      expect(pet!.id).toBe(id);
      expect(pet!.name).toBe('テストペット');
      expect(pet!.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('update', () => {
    it('should update pet name', async () => {
      const id = await repository.create('元の名前');
      await repository.update(id, '新しい名前');
      
      const pet = await repository.findById(id);
      expect(pet!.name).toBe('新しい名前');
    });
  });
});