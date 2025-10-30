import { Router } from 'express';
import { MaintenanceController } from '../controllers/MaintenanceController';
import { MaintenanceService } from '../services/MaintenanceService';
import { MaintenanceRepository } from '../repositories/MaintenanceRepository';
import { getDatabase } from '../database/connection';

const router = Router();
const db = getDatabase();

// リポジトリとサービスの初期化
const maintenanceRepo = new MaintenanceRepository(db);
const maintenanceService = new MaintenanceService(maintenanceRepo);
const maintenanceController = new MaintenanceController(maintenanceService);

// メンテナンス記録
router.get('/maintenance', maintenanceController.getRecords);
router.post('/maintenance/water-filter', maintenanceController.createWaterFilterRecord);
router.post('/maintenance/litter-box', maintenanceController.createLitterBoxRecord);
router.put('/maintenance/:id', maintenanceController.updateRecord);
router.delete('/maintenance/:id', maintenanceController.deleteRecord);

export default router;