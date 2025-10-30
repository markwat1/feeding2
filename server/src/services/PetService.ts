import { PetRepository } from '../repositories/PetRepository';
import { WeightRecordRepository } from '../repositories/WeightRecordRepository';
import { Pet, WeightRecord } from '../types';
import { AppError } from '../middleware/errorHandler';

export class PetService {
  constructor(
    private petRepo: PetRepository,
    private weightRepo: WeightRecordRepository
  ) {}

  async getAllPets(): Promise<Pet[]> {
    return this.petRepo.getAllPets();
  }

  async getPetById(id: number): Promise<Pet> {
    const pet = await this.petRepo.getPetById(id);
    if (!pet) {
      throw new AppError('Pet not found', 404, 'NOT_FOUND');
    }
    return pet;
  }

  async createPet(name: string): Promise<Pet> {
    if (!name.trim()) {
      throw new AppError('Pet name is required', 400, 'VALIDATION_ERROR');
    }

    const id = await this.petRepo.createPet(name.trim());
    const pet = await this.petRepo.getPetById(id);
    
    if (!pet) {
      throw new AppError('Failed to create pet', 500, 'CREATION_ERROR');
    }

    return pet;
  }

  async updatePet(id: number, name: string): Promise<Pet> {
    if (!name.trim()) {
      throw new AppError('Pet name is required', 400, 'VALIDATION_ERROR');
    }

    // ペットが存在するか確認
    await this.getPetById(id);
    
    await this.petRepo.updatePet(id, name.trim());
    const updatedPet = await this.petRepo.getPetById(id);
    
    if (!updatedPet) {
      throw new AppError('Failed to update pet', 500, 'UPDATE_ERROR');
    }

    return updatedPet;
  }

  async deletePet(id: number): Promise<void> {
    // ペットが存在するか確認
    await this.getPetById(id);
    
    // 関連する体重記録も削除
    await this.weightRepo.deleteByPetId(id);
    
    // ペットを削除
    await this.petRepo.deletePet(id);
  }

  async getWeightRecords(petId: number): Promise<WeightRecord[]> {
    // ペットが存在するか確認
    await this.getPetById(petId);
    
    return this.weightRepo.findByPetId(petId);
  }

  async createWeightRecord(petId: number, weight: number, measuredDate: Date): Promise<WeightRecord> {
    // ペットが存在するか確認
    await this.getPetById(petId);

    // 体重の検証（小数点以下2桁まで、正の値）
    if (weight <= 0) {
      throw new AppError('Weight must be a positive number', 400, 'VALIDATION_ERROR');
    }

    // 小数点以下2桁までに制限
    const roundedWeight = Math.round(weight * 100) / 100;
    if (roundedWeight !== weight) {
      throw new AppError('Weight must have at most 2 decimal places', 400, 'VALIDATION_ERROR');
    }

    // 測定日が未来でないことを確認
    const today = new Date();
    today.setHours(23, 59, 59, 999); // 今日の終わりまで許可
    if (measuredDate > today) {
      throw new AppError('Measured date cannot be in the future', 400, 'VALIDATION_ERROR');
    }

    const id = await this.weightRepo.createWeightRecord(petId, roundedWeight, measuredDate);
    const records = await this.weightRepo.findByPetId(petId);
    const created = records.find(r => r.id === id);
    
    if (!created) {
      throw new AppError('Failed to create weight record', 500, 'CREATION_ERROR');
    }

    return created;
  }

  async getLatestWeightRecord(petId: number): Promise<WeightRecord | null> {
    // ペットが存在するか確認
    await this.getPetById(petId);
    
    const record = await this.weightRepo.findLatestByPetId(petId);
    return record || null;
  }

  async getWeightRecordsByDateRange(startDate: Date, endDate: Date): Promise<WeightRecord[]> {
    return this.weightRepo.findByDateRange(startDate, endDate);
  }
}