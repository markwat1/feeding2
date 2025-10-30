import { FeedTypeRepository } from '../repositories/FeedTypeRepository';
import { FeedingScheduleRepository } from '../repositories/FeedingScheduleRepository';
import { FeedingRecordRepository } from '../repositories/FeedingRecordRepository';
import { FeedType, FeedingSchedule, FeedingRecord } from '../types';
import { AppError } from '../middleware/errorHandler';
import { format, parse } from 'date-fns';

export class FeedingService {
  constructor(
    private feedTypeRepo: FeedTypeRepository,
    private scheduleRepo: FeedingScheduleRepository,
    private recordRepo: FeedingRecordRepository
  ) {}

  async getAllFeedTypes(): Promise<FeedType[]> {
    return this.feedTypeRepo.getAllFeedTypes();
  }

  async createFeedType(manufacturer: string, productName: string): Promise<FeedType> {
    if (!manufacturer.trim() || !productName.trim()) {
      throw new AppError('Manufacturer and product name are required', 400, 'VALIDATION_ERROR');
    }

    const id = await this.feedTypeRepo.createFeedType(manufacturer.trim(), productName.trim());
    const feedType = await this.feedTypeRepo.getFeedTypeById(id);
    
    if (!feedType) {
      throw new AppError('Failed to create feed type', 500, 'CREATION_ERROR');
    }

    return feedType;
  }

  async getAllSchedules(): Promise<FeedingSchedule[]> {
    return this.scheduleRepo.getAllSchedules();
  }

  async getActiveSchedules(): Promise<FeedingSchedule[]> {
    return this.scheduleRepo.getActiveSchedules();
  }

  async createSchedule(time: string): Promise<FeedingSchedule> {
    // 時刻フォーマットの検証 (HH:mm)
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      throw new AppError('Invalid time format. Use HH:mm format', 400, 'VALIDATION_ERROR');
    }

    const id = await this.scheduleRepo.createSchedule(time);
    const schedule = await this.scheduleRepo.getAllSchedules();
    const created = schedule.find(s => s.id === id);
    
    if (!created) {
      throw new AppError('Failed to create schedule', 500, 'CREATION_ERROR');
    }

    return created;
  }

  async updateSchedule(id: number, time: string): Promise<FeedingSchedule> {
    // 時刻フォーマットの検証 (HH:mm)
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      throw new AppError('Invalid time format. Use HH:mm format', 400, 'VALIDATION_ERROR');
    }

    // スケジュールが存在するか確認
    const existingSchedule = await this.scheduleRepo.getScheduleById(id);
    if (!existingSchedule) {
      throw new AppError('Schedule not found', 404, 'NOT_FOUND');
    }

    await this.scheduleRepo.updateTime(id, time);
    const updatedSchedule = await this.scheduleRepo.getScheduleById(id);
    
    if (!updatedSchedule) {
      throw new AppError('Failed to update schedule', 500, 'UPDATE_ERROR');
    }

    return updatedSchedule;
  }

  async deleteSchedule(id: number): Promise<void> {
    // スケジュールが存在するか確認
    const existingSchedule = await this.scheduleRepo.getScheduleById(id);
    if (!existingSchedule) {
      throw new AppError('Schedule not found', 404, 'NOT_FOUND');
    }

    await this.scheduleRepo.deleteSchedule(id);
  }

  async toggleScheduleActive(id: number): Promise<FeedingSchedule> {
    const existingSchedule = await this.scheduleRepo.getScheduleById(id);
    if (!existingSchedule) {
      throw new AppError('Schedule not found', 404, 'NOT_FOUND');
    }

    await this.scheduleRepo.updateActive(id, !existingSchedule.isActive);
    const updatedSchedule = await this.scheduleRepo.getScheduleById(id);
    
    if (!updatedSchedule) {
      throw new AppError('Failed to update schedule', 500, 'UPDATE_ERROR');
    }

    return updatedSchedule;
  }

  async getNextScheduledTime(): Promise<string | null> {
    const schedules = await this.scheduleRepo.getActiveSchedules();
    if (schedules.length === 0) return null;

    const now = new Date();
    const currentTime = format(now, 'HH:mm');

    // 今日の残りのスケジュールを探す
    const todaySchedules = schedules.filter(s => s.time > currentTime);
    if (todaySchedules.length > 0) {
      return todaySchedules[0].time;
    }

    // 今日のスケジュールがない場合は明日の最初のスケジュール
    return schedules[0].time;
  }

  async getAllRecords(): Promise<FeedingRecord[]> {
    return this.recordRepo.getAllRecords();
  }

  async getRecordsByDateRange(startDate: Date, endDate: Date): Promise<FeedingRecord[]> {
    return this.recordRepo.findByDateRange(startDate, endDate);
  }

  async getLatestUnconsumedRecord(): Promise<FeedingRecord | null> {
    const record = await this.recordRepo.findLatestWithoutConsumption();
    return record || null;
  }

  async createRecord(feedTypeId: number, feedingTime: Date): Promise<FeedingRecord> {
    // 餌の種類が存在するか確認
    const feedType = await this.feedTypeRepo.getFeedTypeById(feedTypeId);
    if (!feedType) {
      throw new AppError('Feed type not found', 404, 'NOT_FOUND');
    }

    const id = await this.recordRepo.createRecord(feedTypeId, feedingTime);
    const records = await this.recordRepo.getAllRecords();
    const created = records.find(r => r.id === id);
    
    if (!created) {
      throw new AppError('Failed to create feeding record', 500, 'CREATION_ERROR');
    }

    return created;
  }

  async updateConsumption(id: number, consumed: boolean): Promise<FeedingRecord> {
    await this.recordRepo.updateConsumption(id, consumed);
    const records = await this.recordRepo.getAllRecords();
    const updated = records.find(r => r.id === id);
    
    if (!updated) {
      throw new AppError('Feeding record not found', 404, 'NOT_FOUND');
    }

    return updated;
  }

  async updateRecord(id: number, feedTypeId: number, feedingTime: Date): Promise<FeedingRecord> {
    // 餌の種類が存在するか確認
    const feedType = await this.feedTypeRepo.getFeedTypeById(feedTypeId);
    if (!feedType) {
      throw new AppError('Feed type not found', 404, 'NOT_FOUND');
    }

    // 記録が存在するか確認
    const existingRecord = await this.recordRepo.getRecordById(id);
    if (!existingRecord) {
      throw new AppError('Feeding record not found', 404, 'NOT_FOUND');
    }

    await this.recordRepo.updateRecord(id, feedTypeId, feedingTime);
    const updatedRecord = await this.recordRepo.getRecordById(id);
    
    if (!updatedRecord) {
      throw new AppError('Failed to update feeding record', 500, 'UPDATE_ERROR');
    }

    return updatedRecord;
  }

  async deleteRecord(id: number): Promise<void> {
    // 記録が存在するか確認
    const existingRecord = await this.recordRepo.getRecordById(id);
    if (!existingRecord) {
      throw new AppError('Feeding record not found', 404, 'NOT_FOUND');
    }

    await this.recordRepo.deleteRecord(id);
  }
}