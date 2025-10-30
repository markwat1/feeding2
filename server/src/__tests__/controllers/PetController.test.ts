import request from 'supertest';
import express from 'express';
import { PetController } from '../../controllers/PetController';
import { PetService } from '../../services/PetService';
import { PetRepository } from '../../repositories/PetRepository';
import { WeightRecordRepository } from '../../repositories/WeightRecordRepository';
import { setupTestDatabase, cleanupTestDatabase } from '../../test/setup';
import { Database } from '../../database/connection';
import { errorHandler } from '../../middleware/errorHandler';

describe('PetController', () => {
  let app: express.Application;
  let db: Database;

  beforeEach(async () => {
    db = await setupTestDatabase();
    
    const petRepo = new PetRepository(db);
    const weightRepo = new WeightRecordRepository(db);
    const service = new PetService(petRepo, weightRepo);
    const controller = new PetController(service);

    app = express();
    app.use(express.json());
    
    // ルートの設定
    app.get('/api/pets', controller.getPets);
    app.get('/api/pets/:id', controller.getPet);
    app.post('/api/pets', controller.createPet);
    app.put('/api/pets/:id', controller.updatePet);
    app.get('/api/pets/:id/weights', controller.getWeightRecords);
    app.post('/api/pets/:id/weights', controller.createWeightRecord);
    app.get('/api/pets/:id/weights/latest', controller.getLatestWeightRecord);
    app.get('/api/weight-records', controller.getWeightRecordsByDateRange);
    
    app.use(errorHandler);
  });

  afterEach(async () => {
    await cleanupTestDatabase(db);
  });

  describe('GET /api/pets', () => {
    it('should return empty array when no pets exist', async () => {
      const response = await request(app).get('/api/pets');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe('POST /api/pets', () => {
    it('should create a new pet', async () => {
      const petData = { name: 'テストペット' };

      const response = await request(app)
        .post('/api/pets')
        .send(petData);

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('テストペット');
      expect(response.body.id).toBeGreaterThan(0);
    });

    it('should return 400 for empty name', async () => {
      const response = await request(app)
        .post('/api/pets')
        .send({ name: '' });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/pets/:id', () => {
    it('should return pet by id', async () => {
      const createResponse = await request(app)
        .post('/api/pets')
        .send({ name: 'テストペット' });

      const response = await request(app)
        .get(`/api/pets/${createResponse.body.id}`);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('テストペット');
    });

    it('should return 404 for non-existent pet', async () => {
      const response = await request(app).get('/api/pets/999');

      expect(response.status).toBe(404);
      expect(response.body.code).toBe('NOT_FOUND');
    });
  });

  describe('PUT /api/pets/:id', () => {
    it('should update pet name', async () => {
      const createResponse = await request(app)
        .post('/api/pets')
        .send({ name: '元の名前' });

      const response = await request(app)
        .put(`/api/pets/${createResponse.body.id}`)
        .send({ name: '新しい名前' });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('新しい名前');
    });
  });

  describe('POST /api/pets/:id/weights', () => {
    it('should create a weight record', async () => {
      const petResponse = await request(app)
        .post('/api/pets')
        .send({ name: 'テストペット' });

      const weightData = {
        weight: 5.25,
        measuredDate: '2023-12-01'
      };

      const response = await request(app)
        .post(`/api/pets/${petResponse.body.id}/weights`)
        .send(weightData);

      expect(response.status).toBe(201);
      expect(response.body.weight).toBe(5.25);
      expect(response.body.petId).toBe(petResponse.body.id);
    });

    it('should return 400 for missing required fields', async () => {
      const petResponse = await request(app)
        .post('/api/pets')
        .send({ name: 'テストペット' });

      const response = await request(app)
        .post(`/api/pets/${petResponse.body.id}/weights`)
        .send({ weight: 5.25 }); // measuredDate missing

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid weight', async () => {
      const petResponse = await request(app)
        .post('/api/pets')
        .send({ name: 'テストペット' });

      const response = await request(app)
        .post(`/api/pets/${petResponse.body.id}/weights`)
        .send({ weight: 'invalid', measuredDate: '2023-12-01' });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/pets/:id/weights', () => {
    it('should return weight records for a pet', async () => {
      const petResponse = await request(app)
        .post('/api/pets')
        .send({ name: 'テストペット' });

      await request(app)
        .post(`/api/pets/${petResponse.body.id}/weights`)
        .send({ weight: 5.25, measuredDate: '2023-12-01' });

      const response = await request(app)
        .get(`/api/pets/${petResponse.body.id}/weights`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].weight).toBe(5.25);
    });
  });

  describe('GET /api/pets/:id/weights/latest', () => {
    it('should return latest weight record', async () => {
      const petResponse = await request(app)
        .post('/api/pets')
        .send({ name: 'テストペット' });

      await request(app)
        .post(`/api/pets/${petResponse.body.id}/weights`)
        .send({ weight: 5.0, measuredDate: '2023-12-01' });

      await request(app)
        .post(`/api/pets/${petResponse.body.id}/weights`)
        .send({ weight: 5.1, measuredDate: '2023-12-02' });

      const response = await request(app)
        .get(`/api/pets/${petResponse.body.id}/weights/latest`);

      expect(response.status).toBe(200);
      expect(response.body.weight).toBe(5.1);
    });

    it('should return null when no records exist', async () => {
      const petResponse = await request(app)
        .post('/api/pets')
        .send({ name: 'テストペット' });

      const response = await request(app)
        .get(`/api/pets/${petResponse.body.id}/weights/latest`);

      expect(response.status).toBe(200);
      expect(response.body).toBeNull();
    });
  });

  describe('GET /api/weight-records', () => {
    it('should return weight records within date range', async () => {
      const petResponse = await request(app)
        .post('/api/pets')
        .send({ name: 'テストペット' });

      await request(app)
        .post(`/api/pets/${petResponse.body.id}/weights`)
        .send({ weight: 5.0, measuredDate: '2023-12-01' });

      const response = await request(app)
        .get('/api/weight-records')
        .query({ startDate: '2023-12-01', endDate: '2023-12-01' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
    });

    it('should return 400 for missing date parameters', async () => {
      const response = await request(app)
        .get('/api/weight-records')
        .query({ startDate: '2023-12-01' }); // endDate missing

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });
  });
});