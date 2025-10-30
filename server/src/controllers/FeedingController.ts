import { Request, Response, NextFunction } from 'express';
import { FeedingService } from '../services/FeedingService';
import { AppError } from '../middleware/errorHandler';

export class FeedingController {
  constructor(private feedingService: FeedingService) {}

  // 餌の種類関連
  getFeedTypes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const feedTypes = await this.feedingService.getAllFeedTypes();
      res.json(feedTypes);
    } catch (error) {
      next(error);
    }
  };

  createFeedType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { manufacturer, productName } = req.body;
      const feedType = await this.feedingService.createFeedType(manufacturer, productName);
      res.status(201).json(feedType);
    } catch (error) {
      next(error);
    }
  };

  // スケジュール関連
  getSchedules = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const schedules = await this.feedingService.getAllSchedules();
      res.json(schedules);
    } catch (error) {
      next(error);
    }
  };

  createSchedule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { time } = req.body;
      const schedule = await this.feedingService.createSchedule(time);
      res.status(201).json(schedule);
    } catch (error) {
      next(error);
    }
  };

  getNextScheduledTime = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const nextTime = await this.feedingService.getNextScheduledTime();
      res.json({ nextTime });
    } catch (error) {
      next(error);
    }
  };

  getNextUnrecordedScheduledTime = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const nextTime = await this.feedingService.getNextUnrecordedScheduledTime();
      res.json({ nextTime });
    } catch (error) {
      next(error);
    }
  };

  updateSchedule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { time } = req.body;
      const schedule = await this.feedingService.updateSchedule(parseInt(id), time);
      res.json(schedule);
    } catch (error) {
      next(error);
    }
  };

  deleteSchedule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.feedingService.deleteSchedule(parseInt(id));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  toggleScheduleActive = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const schedule = await this.feedingService.toggleScheduleActive(parseInt(id));
      res.json(schedule);
    } catch (error) {
      next(error);
    }
  };

  // 餌やり記録関連
  getRecords = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { startDate, endDate } = req.query;
      
      let records;
      if (startDate && endDate) {
        const start = new Date(startDate as string);
        const end = new Date(endDate as string);
        records = await this.feedingService.getRecordsByDateRange(start, end);
      } else {
        records = await this.feedingService.getAllRecords();
      }
      
      res.json(records);
    } catch (error) {
      next(error);
    }
  };

  createRecord = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { feedTypeId, feedingTime } = req.body;
      
      if (!feedTypeId || !feedingTime) {
        throw new AppError('Feed type ID and feeding time are required', 400, 'VALIDATION_ERROR');
      }

      const record = await this.feedingService.createRecord(
        parseInt(feedTypeId),
        new Date(feedingTime)
      );
      res.status(201).json(record);
    } catch (error) {
      next(error);
    }
  };

  updateConsumption = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { consumed } = req.body;
      
      if (typeof consumed !== 'boolean') {
        throw new AppError('Consumed must be a boolean value', 400, 'VALIDATION_ERROR');
      }

      const record = await this.feedingService.updateConsumption(parseInt(id), consumed);
      res.json(record);
    } catch (error) {
      next(error);
    }
  };

  getLatestUnconsumed = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const record = await this.feedingService.getLatestUnconsumedRecord();
      res.json(record);
    } catch (error) {
      next(error);
    }
  };

  updateRecord = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { feedTypeId, feedingTime } = req.body;
      
      if (!feedTypeId || !feedingTime) {
        throw new AppError('Feed type ID and feeding time are required', 400, 'VALIDATION_ERROR');
      }

      const record = await this.feedingService.updateRecord(
        parseInt(id),
        parseInt(feedTypeId),
        new Date(feedingTime)
      );
      res.json(record);
    } catch (error) {
      next(error);
    }
  };

  deleteRecord = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.feedingService.deleteRecord(parseInt(id));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}