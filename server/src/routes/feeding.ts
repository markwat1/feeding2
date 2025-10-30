import { Router } from 'express';
import { FeedingController } from '../controllers/FeedingController';
import { FeedingService } from '../services/FeedingService';
import { FeedTypeRepository } from '../repositories/FeedTypeRepository';
import { FeedingScheduleRepository } from '../repositories/FeedingScheduleRepository';
import { FeedingRecordRepository } from '../repositories/FeedingRecordRepository';
import { getDatabase } from '../database/connection';

const router = Router();
const db = getDatabase();

// リポジトリとサービスの初期化
const feedTypeRepo = new FeedTypeRepository(db);
const scheduleRepo = new FeedingScheduleRepository(db);
const recordRepo = new FeedingRecordRepository(db);
const feedingService = new FeedingService(feedTypeRepo, scheduleRepo, recordRepo);
const feedingController = new FeedingController(feedingService);

// 餌の種類
router.get('/feeds', feedingController.getFeedTypes);
router.post('/feeds', feedingController.createFeedType);

// 餌やりスケジュール
router.get('/feeding-schedules', feedingController.getSchedules);
router.post('/feeding-schedules', feedingController.createSchedule);
router.get('/feeding-schedules/next', feedingController.getNextScheduledTime);
router.put('/feeding-schedules/:id', feedingController.updateSchedule);
router.delete('/feeding-schedules/:id', feedingController.deleteSchedule);
router.patch('/feeding-schedules/:id/toggle', feedingController.toggleScheduleActive);

// 餌やり記録
router.get('/feeding-records', feedingController.getRecords);
router.post('/feeding-records', feedingController.createRecord);
router.put('/feeding-records/:id', feedingController.updateConsumption);
router.patch('/feeding-records/:id', feedingController.updateRecord);
router.delete('/feeding-records/:id', feedingController.deleteRecord);
router.get('/feeding-records/latest-unconsumed', feedingController.getLatestUnconsumed);

export default router;