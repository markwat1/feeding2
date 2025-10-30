import { Request, Response, NextFunction } from 'express';
import { PetService } from '../services/PetService';
import { AppError } from '../middleware/errorHandler';

export class PetController {
  constructor(private petService: PetService) {}

  // ペット関連
  getPets = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pets = await this.petService.getAllPets();
      res.json(pets);
    } catch (error) {
      next(error);
    }
  };

  getPet = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const pet = await this.petService.getPetById(parseInt(id));
      res.json(pet);
    } catch (error) {
      next(error);
    }
  };

  createPet = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name } = req.body;
      const pet = await this.petService.createPet(name);
      res.status(201).json(pet);
    } catch (error) {
      next(error);
    }
  };

  updatePet = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { name } = req.body;
      const pet = await this.petService.updatePet(parseInt(id), name);
      res.json(pet);
    } catch (error) {
      next(error);
    }
  };

  deletePet = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.petService.deletePet(parseInt(id));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  // 体重記録関連
  getWeightRecords = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const records = await this.petService.getWeightRecords(parseInt(id));
      res.json(records);
    } catch (error) {
      next(error);
    }
  };

  createWeightRecord = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { weight, measuredDate } = req.body;
      
      if (weight === undefined || !measuredDate) {
        throw new AppError('Weight and measured date are required', 400, 'VALIDATION_ERROR');
      }

      const weightNum = parseFloat(weight);
      if (isNaN(weightNum)) {
        throw new AppError('Weight must be a valid number', 400, 'VALIDATION_ERROR');
      }

      const record = await this.petService.createWeightRecord(
        parseInt(id),
        weightNum,
        new Date(measuredDate)
      );
      res.status(201).json(record);
    } catch (error) {
      next(error);
    }
  };

  getLatestWeightRecord = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const record = await this.petService.getLatestWeightRecord(parseInt(id));
      res.json(record);
    } catch (error) {
      next(error);
    }
  };

  // 日付範囲での体重記録取得
  getWeightRecordsByDateRange = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        throw new AppError('Start date and end date are required', 400, 'VALIDATION_ERROR');
      }

      const records = await this.petService.getWeightRecordsByDateRange(
        new Date(startDate as string),
        new Date(endDate as string)
      );
      res.json(records);
    } catch (error) {
      next(error);
    }
  };
}