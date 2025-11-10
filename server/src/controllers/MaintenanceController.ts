import { Request, Response, NextFunction } from 'express';
import { MaintenanceService } from '../services/MaintenanceService';
import { AppError } from '../middleware/errorHandler';

export class MaintenanceController {
  constructor(private maintenanceService: MaintenanceService) {}

  getRecords = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { type } = req.query;
      
      let records;
      if (type && (type === 'water_filter' || type === 'litter_box' || type === 'nail_clipping')) {
        records = await this.maintenanceService.getRecordsByType(type as 'water_filter' | 'litter_box' | 'nail_clipping');
      } else {
        records = await this.maintenanceService.getAllRecords();
      }
      
      res.json(records);
    } catch (error) {
      next(error);
    }
  };

  createWaterFilterRecord = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { performedAt, notes } = req.body;
      
      if (!performedAt) {
        throw new AppError('Performed date is required', 400, 'VALIDATION_ERROR');
      }

      const record = await this.maintenanceService.createWaterFilterRecord(
        new Date(performedAt),
        notes
      );
      res.status(201).json(record);
    } catch (error) {
      next(error);
    }
  };

  createLitterBoxRecord = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { performedAt, notes } = req.body;
      
      if (!performedAt) {
        throw new AppError('Performed date is required', 400, 'VALIDATION_ERROR');
      }

      const record = await this.maintenanceService.createLitterBoxRecord(
        new Date(performedAt),
        notes
      );
      res.status(201).json(record);
    } catch (error) {
      next(error);
    }
  };

  createNailClippingRecord = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { performedAt, notes } = req.body;
      
      if (!performedAt) {
        throw new AppError('Performed date is required', 400, 'VALIDATION_ERROR');
      }

      const record = await this.maintenanceService.createNailClippingRecord(
        new Date(performedAt),
        notes
      );
      res.status(201).json(record);
    } catch (error) {
      next(error);
    }
  };

  updateRecord = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { type, performedAt, notes } = req.body;
      
      if (!type || !performedAt) {
        throw new AppError('Type and performed date are required', 400, 'VALIDATION_ERROR');
      }

      const record = await this.maintenanceService.updateRecord(
        parseInt(id),
        type,
        new Date(performedAt),
        notes
      );
      res.json(record);
    } catch (error) {
      next(error);
    }
  };

  deleteRecord = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.maintenanceService.deleteRecord(parseInt(id));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}