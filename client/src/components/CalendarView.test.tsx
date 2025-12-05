import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { CalendarView } from './CalendarView';
import { feedingRecordApi, weightRecordApi, maintenanceApi, feedTypeApi } from '../services/api';

// Mock the API modules
vi.mock('../services/api', () => ({
  feedingRecordApi: {
    getByDateRange: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    updateConsumption: vi.fn(),
  },
  weightRecordApi: {
    getByDateRange: vi.fn(),
  },
  maintenanceApi: {
    getAll: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  feedTypeApi: {
    getAll: vi.fn(),
  },
}));

const renderComponent = () => {
  return render(<CalendarView />);
};

describe('CalendarView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementations
    vi.mocked(feedTypeApi.getAll).mockResolvedValue({
      data: [
        { id: 1, manufacturer: 'メーカーA', productName: '商品A', createdAt: new Date() },
        { id: 2, manufacturer: 'メーカーB', productName: '商品B', createdAt: new Date() },
      ],
    } as any);
    
    vi.mocked(feedingRecordApi.getByDateRange).mockResolvedValue({
      data: [],
    } as any);
    
    vi.mocked(weightRecordApi.getByDateRange).mockResolvedValue({
      data: [],
    } as any);
    
    vi.mocked(maintenanceApi.getAll).mockResolvedValue({
      data: [],
    } as any);
  });

  describe('Calendar Display Logic', () => {
    it('should render calendar with current month', async () => {
      renderComponent();
      
      await waitFor(() => {
        const currentDate = new Date();
        const yearMonth = `${currentDate.getFullYear()}年${String(currentDate.getMonth() + 1).padStart(2, '0')}月`;
        expect(screen.getByText(yearMonth)).toBeInTheDocument();
      });
    });

    it('should display weekday headers', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('日')).toBeInTheDocument();
        expect(screen.getByText('月')).toBeInTheDocument();
        expect(screen.getByText('火')).toBeInTheDocument();
        expect(screen.getByText('水')).toBeInTheDocument();
        expect(screen.getByText('木')).toBeInTheDocument();
        expect(screen.getByText('金')).toBeInTheDocument();
        expect(screen.getByText('土')).toBeInTheDocument();
      });
    });

    it('should load data for the current month on mount', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(feedingRecordApi.getByDateRange).toHaveBeenCalled();
        expect(weightRecordApi.getByDateRange).toHaveBeenCalled();
        expect(maintenanceApi.getAll).toHaveBeenCalled();
        expect(feedTypeApi.getAll).toHaveBeenCalled();
      });
    });

    it('should display feeding records with timestamps', async () => {
      // Use current month for test data
      const now = new Date();
      const feedingTime = new Date(now.getFullYear(), now.getMonth(), 15, 8, 30, 0);
      vi.mocked(feedingRecordApi.getByDateRange).mockResolvedValue({
        data: [
          {
            id: 1,
            feedTypeId: 1,
            feedingTime: feedingTime,
            consumed: true,
            createdAt: new Date(),
            feedType: { id: 1, manufacturer: 'メーカーA', productName: '商品A', createdAt: new Date() },
          },
        ],
      } as any);
      
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('08:30')).toBeInTheDocument();
        expect(screen.getByText('商品A')).toBeInTheDocument();
      });
    });

    it('should display multiple feeding records for the same day', async () => {
      // Use current month for test data
      const now = new Date();
      vi.mocked(feedingRecordApi.getByDateRange).mockResolvedValue({
        data: [
          {
            id: 1,
            feedTypeId: 1,
            feedingTime: new Date(now.getFullYear(), now.getMonth(), 15, 8, 0, 0),
            consumed: true,
            createdAt: new Date(),
            feedType: { id: 1, manufacturer: 'メーカーA', productName: '商品A', createdAt: new Date() },
          },
          {
            id: 2,
            feedTypeId: 2,
            feedingTime: new Date(now.getFullYear(), now.getMonth(), 15, 18, 0, 0),
            consumed: false,
            createdAt: new Date(),
            feedType: { id: 2, manufacturer: 'メーカーB', productName: '商品B', createdAt: new Date() },
          },
        ],
      } as any);
      
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('08:00')).toBeInTheDocument();
        expect(screen.getByText('18:00')).toBeInTheDocument();
        expect(screen.getByText('商品A')).toBeInTheDocument();
        expect(screen.getByText('商品B')).toBeInTheDocument();
      });
    });
  });

  describe('Color-Coded Display', () => {
    it('should display consumed records in green', async () => {
      const now = new Date();
      vi.mocked(feedingRecordApi.getByDateRange).mockResolvedValue({
        data: [
          {
            id: 1,
            feedTypeId: 1,
            feedingTime: new Date(now.getFullYear(), now.getMonth(), 15, 8, 0, 0),
            consumed: true,
            createdAt: new Date(),
            feedType: { id: 1, manufacturer: 'メーカーA', productName: '商品A', createdAt: new Date() },
          },
        ],
      } as any);
      
      renderComponent();
      
      await waitFor(() => {
        const feedingTime = screen.getByText('08:00');
        const feedingIndicator = feedingTime.parentElement;
        expect(feedingIndicator?.className).toMatch(/consumed/);
      });
    });

    it('should display not consumed records in yellow', async () => {
      const now = new Date();
      vi.mocked(feedingRecordApi.getByDateRange).mockResolvedValue({
        data: [
          {
            id: 1,
            feedTypeId: 1,
            feedingTime: new Date(now.getFullYear(), now.getMonth(), 15, 8, 0, 0),
            consumed: false,
            createdAt: new Date(),
            feedType: { id: 1, manufacturer: 'メーカーA', productName: '商品A', createdAt: new Date() },
          },
        ],
      } as any);
      
      renderComponent();
      
      await waitFor(() => {
        const feedingTime = screen.getByText('08:00');
        const feedingIndicator = feedingTime.parentElement;
        expect(feedingIndicator?.className).toMatch(/notConsumed/);
      });
    });

    it('should display unrecorded consumption status in gray', async () => {
      const now = new Date();
      vi.mocked(feedingRecordApi.getByDateRange).mockResolvedValue({
        data: [
          {
            id: 1,
            feedTypeId: 1,
            feedingTime: new Date(now.getFullYear(), now.getMonth(), 15, 8, 0, 0),
            consumed: null,
            createdAt: new Date(),
            feedType: { id: 1, manufacturer: 'メーカーA', productName: '商品A', createdAt: new Date() },
          },
        ],
      } as any);
      
      renderComponent();
      
      await waitFor(() => {
        const feedingTime = screen.getByText('08:00');
        const feedingIndicator = feedingTime.parentElement;
        expect(feedingIndicator?.className).toMatch(/unknown/);
      });
    });
  });

  describe('Weight and Maintenance Records Display', () => {
    it('should display weight records', async () => {
      const now = new Date();
      vi.mocked(weightRecordApi.getByDateRange).mockResolvedValue({
        data: [
          {
            id: 1,
            petId: 1,
            weight: 4.5,
            measuredDate: new Date(now.getFullYear(), now.getMonth(), 15),
            createdAt: new Date(),
            pet: { id: 1, name: 'ペット1', createdAt: new Date() },
          },
        ],
      } as any);
      
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('4.5kg')).toBeInTheDocument();
      });
    });

    it('should display maintenance records', async () => {
      const now = new Date();
      vi.mocked(maintenanceApi.getAll).mockResolvedValue({
        data: [
          {
            id: 1,
            type: 'water_filter',
            performedAt: new Date(now.getFullYear(), now.getMonth(), 15, 10, 0, 0),
            notes: '',
            createdAt: new Date(),
          },
        ],
      } as any);
      
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('フィルター')).toBeInTheDocument();
      });
    });

    it('should display multiple maintenance types', async () => {
      const now = new Date();
      vi.mocked(maintenanceApi.getAll).mockResolvedValue({
        data: [
          {
            id: 1,
            type: 'water_filter',
            performedAt: new Date(now.getFullYear(), now.getMonth(), 15, 10, 0, 0),
            notes: '',
            createdAt: new Date(),
          },
          {
            id: 2,
            type: 'litter_box',
            performedAt: new Date(now.getFullYear(), now.getMonth(), 15, 11, 0, 0),
            notes: '',
            createdAt: new Date(),
          },
          {
            id: 3,
            type: 'nail_clipping',
            performedAt: new Date(now.getFullYear(), now.getMonth(), 15, 12, 0, 0),
            notes: '',
            createdAt: new Date(),
          },
        ],
      } as any);
      
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('フィルター')).toBeInTheDocument();
        expect(screen.getByText('トイレ砂')).toBeInTheDocument();
        expect(screen.getByText('爪切り')).toBeInTheDocument();
      });
    });
  });
});
