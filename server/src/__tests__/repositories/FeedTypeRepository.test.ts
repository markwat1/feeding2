import { FeedTypeRepository } from '../../repositories/FeedTypeRepository';
import { setupTestDatabase, cleanupTestDatabase } from '../../test/setup';
import { Database } from '../../database/connection';

describe('FeedTypeRepository', () => {
  let db: Database;
  let repository: FeedTypeRepository;

  beforeEach(async () => {
    db = await setupTestDatabase();
    repository = new FeedTypeRepository(db);
  });

  afterEach(async () => {
    await cleanupTestDatabase(db);
  });

  describe('createFeedType', () => {
    it('should create a new feed type', async () => {
      const id = await repository.createFeedType('テストメーカー', 'テスト商品');
      expect(id).toBeGreaterThan(0);
    });
  });

  describe('findAll', () => {
    it('should return empty array when no feed types exist', async () => {
      const feedTypes = await repository.findAll();
      expect(feedTypes).toEqual([]);
    });

    it('should return all feed types ordered by manufacturer and product name', async () => {
      await repository.createFeedType('メーカーB', '商品2');
      await repository.createFeedType('メーカーA', '商品1');
      await repository.createFeedType('メーカーA', '商品2');

      const feedTypes = await repository.findAll();
      expect(feedTypes).toHaveLength(3);
      expect(feedTypes[0].manufacturer).toBe('メーカーA');
      expect(feedTypes[0].productName).toBe('商品1');
      expect(feedTypes[1].manufacturer).toBe('メーカーA');
      expect(feedTypes[1].productName).toBe('商品2');
      expect(feedTypes[2].manufacturer).toBe('メーカーB');
    });
  });

  describe('findById', () => {
    it('should return undefined when feed type does not exist', async () => {
      const feedType = await repository.findById(999);
      expect(feedType).toBeUndefined();
    });

    it('should return feed type when it exists', async () => {
      const id = await repository.createFeedType('テストメーカー', 'テスト商品');
      const feedType = await repository.findById(id);
      
      expect(feedType).toBeDefined();
      expect(feedType!.id).toBe(id);
      expect(feedType!.manufacturer).toBe('テストメーカー');
      expect(feedType!.productName).toBe('テスト商品');
      expect(feedType!.createdAt).toBeInstanceOf(Date);
    });
  });
});