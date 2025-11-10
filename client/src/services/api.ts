import axios from 'axios';
import { FeedType, FeedingSchedule, FeedingRecord, Pet, WeightRecord, MaintenanceRecord } from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// エラーハンドリング
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// 餌の種類API
export const feedTypeApi = {
  getAll: () => api.get<FeedType[]>('/feeds'),
  create: (manufacturer: string, productName: string) =>
    api.post<FeedType>('/feeds', { manufacturer, productName }),
};

// 餌やりスケジュールAPI
export const scheduleApi = {
  getAll: () => api.get<FeedingSchedule[]>('/feeding-schedules'),
  create: (time: string) => api.post<FeedingSchedule>('/feeding-schedules', { time }),
  update: (id: number, time: string) => api.put<FeedingSchedule>(`/feeding-schedules/${id}`, { time }),
  delete: (id: number) => api.delete(`/feeding-schedules/${id}`),
  toggleActive: (id: number) => api.patch<FeedingSchedule>(`/feeding-schedules/${id}/toggle`),
  getNext: () => api.get<{ nextTime: string | null }>('/feeding-schedules/next'),
  getNextUnrecorded: () => api.get<{ nextTime: string | null }>('/feeding-schedules/next-unrecorded'),
};

// 餌やり記録API
export const feedingRecordApi = {
  getAll: () => api.get<FeedingRecord[]>('/feeding-records'),
  getByDateRange: (startDate: string, endDate: string) =>
    api.get<FeedingRecord[]>('/feeding-records', { params: { startDate, endDate } }),
  create: (feedTypeId: number, feedingTime: string) =>
    api.post<FeedingRecord>('/feeding-records', { feedTypeId, feedingTime }),
  updateConsumption: (id: number, consumed: boolean | null) =>
    api.put<FeedingRecord>(`/feeding-records/${id}`, { consumed }),
  update: (id: number, feedTypeId: number, feedingTime: string) =>
    api.patch<FeedingRecord>(`/feeding-records/${id}`, { feedTypeId, feedingTime }),
  delete: (id: number) => api.delete(`/feeding-records/${id}`),
  getLatestUnconsumed: () => api.get<FeedingRecord | null>('/feeding-records/latest-unconsumed'),
};

// ペットAPI
export const petApi = {
  getAll: () => api.get<Pet[]>('/pets'),
  getById: (id: number) => api.get<Pet>(`/pets/${id}`),
  create: (name: string) => api.post<Pet>('/pets', { name }),
  update: (id: number, name: string) => api.put<Pet>(`/pets/${id}`, { name }),
  delete: (id: number) => api.delete(`/pets/${id}`),
};

// 体重記録API
export const weightRecordApi = {
  getByPet: (petId: number) => api.get<WeightRecord[]>(`/pets/${petId}/weights`),
  create: (petId: number, weight: number, measuredDate: string) =>
    api.post<WeightRecord>(`/pets/${petId}/weights`, { weight, measuredDate }),
  getLatest: (petId: number) => api.get<WeightRecord | null>(`/pets/${petId}/weights/latest`),
  getByDateRange: (startDate: string, endDate: string) =>
    api.get<WeightRecord[]>('/weight-records', { params: { startDate, endDate } }),
};

// メンテナンスAPI
export const maintenanceApi = {
  getAll: () => api.get<MaintenanceRecord[]>('/maintenance'),
  getByType: (type: 'water_filter' | 'litter_box' | 'nail_clipping') =>
    api.get<MaintenanceRecord[]>('/maintenance', { params: { type } }),
  createWaterFilter: (performedAt: string, notes?: string) =>
    api.post<MaintenanceRecord>('/maintenance/water-filter', { performedAt, notes }),
  createLitterBox: (performedAt: string, notes?: string) =>
    api.post<MaintenanceRecord>('/maintenance/litter-box', { performedAt, notes }),
  createNailClipping: (performedAt: string, notes?: string) =>
    api.post<MaintenanceRecord>('/maintenance/nail-clipping', { performedAt, notes }),
  update: (id: number, type: 'water_filter' | 'litter_box' | 'nail_clipping', performedAt: string, notes?: string) =>
    api.put<MaintenanceRecord>(`/maintenance/${id}`, { type, performedAt, notes }),
  delete: (id: number) => api.delete(`/maintenance/${id}`),
};