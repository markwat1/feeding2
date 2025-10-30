import { Router } from 'express';
import { PetController } from '../controllers/PetController';
import { PetService } from '../services/PetService';
import { PetRepository } from '../repositories/PetRepository';
import { WeightRecordRepository } from '../repositories/WeightRecordRepository';
import { getDatabase } from '../database/connection';

const router = Router();
const db = getDatabase();

// リポジトリとサービスの初期化
const petRepo = new PetRepository(db);
const weightRepo = new WeightRecordRepository(db);
const petService = new PetService(petRepo, weightRepo);
const petController = new PetController(petService);

// ペット管理
router.get('/pets', petController.getPets);
router.get('/pets/:id', petController.getPet);
router.post('/pets', petController.createPet);
router.put('/pets/:id', petController.updatePet);
router.delete('/pets/:id', petController.deletePet);

// 体重記録
router.get('/pets/:id/weights', petController.getWeightRecords);
router.post('/pets/:id/weights', petController.createWeightRecord);
router.get('/pets/:id/weights/latest', petController.getLatestWeightRecord);

// 日付範囲での体重記録取得
router.get('/weight-records', petController.getWeightRecordsByDateRange);

export default router;