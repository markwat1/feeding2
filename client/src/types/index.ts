export interface FeedType {
  id: number;
  manufacturer: string;
  productName: string;
  createdAt: Date;
}

export interface Pet {
  id: number;
  name: string;
  createdAt: Date;
}

export interface FeedingSchedule {
  id: number;
  time: string;
  isActive: boolean;
  createdAt: Date;
}

export interface FeedingRecord {
  id: number;
  feedTypeId: number;
  feedingTime: Date;
  consumed: boolean | null;
  createdAt: Date;
  feedType?: FeedType;
}

export interface WeightRecord {
  id: number;
  petId: number;
  weight: number;
  measuredDate: Date;
  createdAt: Date;
  pet?: Pet;
}

export interface MaintenanceRecord {
  id: number;
  type: 'water_filter' | 'litter_box';
  performedAt: Date;
  notes?: string;
  createdAt: Date;
}