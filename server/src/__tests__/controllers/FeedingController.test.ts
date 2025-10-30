import request from 'supertest';
import express from 'express';
import { FeedingController } from '../../controllers/FeedingController';
import { FeedingService } from '../../services/FeedingService';
import { FeedTypeRepository } from '../../repositories/FeedTypeRepository';
import { FeedingScheduleRepository } from '../../repositories/FeedingScheduleRepository';
import { FeedingRecordRepository } from '../../repositories/FeedingRecordRepository';
import { setupTestDatabase, cleanupTestDatabase } from '../../test/setup';
import { Database } from '../../database/connection';
import { errorHandler } from '../../middleware/errorHandler';

describe('FeedingController', () => {
  let app: express.Application;
  let db: Database;

  beforeEach(async () => {
    db = await setupTestDatabase();
    
    const feedTypeRepo = new FeedTypeRepository(db);
    const scheduleRepo = new FeedingScheduleRepository(db);
    const recordRepo = new FeedingRecordRepository(db);
    const service = new FeedingService(feedTypeRepo, scheduleRepo, recordRepo);
    const controller = new FeedingController(service);

    app = express();
    app.use(express.json());
    
    // ルートの設定
    app.get('/api/feeds', controller.getFeedTypes);
    app.post('/api/feeds', controller.createFeedType);
    app.get('/api/feeding-schedules', controller.getSchedules);
    app.post('/api/feeding-schedules', controller.createSchedule);
    app.get('/api/feeding-schedules/next', controller.getNextScheduledTime);
    app.get('/api/feeding-records', controller.getRecords);
    app.post('/api/feeding-records', controller.createRecord);
    app.put('/api/feeding-records/:id', controller.updateConsumption);
    app.get('/api/feeding-records/latest-unconsumed', controller.getLatestUnconsumed);
    
    app.use(errorHandler);
  });

  afterEach(async () => {
    await cleanupTestDatabase(db);
  });

  describe('GET /api/feeds', () => {
    it('should return empty array when no feed types exist', async () => {
      const response = await request(app).get('/api/feeds');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe('POST /api/feeds', () => {
    it('should create a new feed type', async () => {
      const feedTypeData = {
        manufacturer: 'テストメーカー',
        productName: 'テスト商品'
      };

      const response = await request(app)
        .post('/api/feeds')
        .send(feedTypeData);

      expect(response.status).toBe(201);
      expect(response.body.manufacturer).toBe('テストメーカー');
      expect(response.body.productName).toBe('テスト商品');
      expect(response.body.id).toBeGreaterThan(0);
    });

    it('should return 400 for invalid data', async () => {
      const response = await request(app)
        .post('/api/feeds')
        .send({ manufacturer: '', productName: 'テスト商品' });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/feeding-schedules', () => {
    it('should create a new schedule', async () => {
      const scheduleData = { time: '08:00' };

      const response = await request(app)
        .post('/api/feeding-schedules')
        .send(scheduleData);

      expect(response.status).toBe(201);
      expect(response.body.time).toBe('08:00');
      expect(response.body.isActive).toBe(true);
    });

    it('should return 400 for invalid time format', async () => {
      const response = await request(app)
        .post('/api/feeding-schedules')
        .send({ time: '25:00' });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/feeding-records', () => {
    it('should create a new feeding record', async () => {
      // まず餌の種類を作成
      const feedTypeResponse = await request(app)
        .post('/api/feeds')
        .send({ manufacturer: 'テストメーカー', productName: 'テスト商品' });

      const recordData = {
        feedTypeId: feedTypeResponse.body.id,
        feedingTime: '2023-12-01T08:00:00Z'
      };

      const response = await request(app)
        .post('/api/feeding-records')
        .send(recordData);

      expect(response.status).toBe(201);
      expect(response.body.feedTypeId).toBe(feedTypeResponse.body.id);
      expect(response.body.consumed).toBeNull();
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/feeding-records')
        .send({ feedTypeId: 1 }); // feedingTime missing

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('PUT /api/feeding-records/:id', () => {
    it('should update consumption status', async () => {
      // 餌の種類と記録を作成
      const feedTypeResponse = await request(app)
        .post('/api/feeds')
        .send({ manufacturer: 'テストメーカー', productName: 'テスト商品' });

      const recordResponse = await request(app)
        .post('/api/feeding-records')
        .send({
          feedTypeId: feedTypeResponse.body.id,
          feedingTime: '2023-12-01T08:00:00Z'
        });

      const response = await request(app)
        .put(`/api/feeding-records/${recordResponse.body.id}`)
        .send({ consumed: true });

      expect(response.status).toBe(200);
      expect(response.body.consumed).toBe(true);
    });

    it('should return 400 for invalid consumed value', async () => {
      const response = await request(app)
        .put('/api/feeding-records/1')
        .send({ consumed: 'invalid' });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });
  });
});