import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { MaintenanceRecord } from './MaintenanceRecord';
import { maintenanceApi } from '../services/api';

// Mock the API module
vi.mock('../services/api', () => ({
  maintenanceApi: {
    getAll: vi.fn(),
    createWaterFilter: vi.fn(),
    createLitterBox: vi.fn(),
    createNailClipping: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

const renderComponent = () => {
  return render(
    <BrowserRouter>
      <MaintenanceRecord />
    </BrowserRouter>
  );
};

describe('MaintenanceRecord', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementation
    vi.mocked(maintenanceApi.getAll).mockResolvedValue({
      data: [],
    } as any);
  });

  describe('Maintenance Record Form Tests', () => {
    it('should render the form with all required fields', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('メンテナンス記録')).toBeInTheDocument();
      });
      
      expect(screen.getByText('実施日時')).toBeInTheDocument();
      expect(screen.getByText('メモ（任意）')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '給水器フィルター交換' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'トイレ砂交換' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '爪切り' })).toBeInTheDocument();
    });

    it('should create water filter maintenance record successfully', async () => {
      const user = userEvent.setup();
      const newRecord = {
        id: 1,
        type: 'water_filter' as const,
        performedAt: new Date('2024-01-01T10:00:00'),
        notes: 'テストメモ',
        createdAt: new Date(),
      };
      
      vi.mocked(maintenanceApi.createWaterFilter).mockResolvedValue({
        data: newRecord,
      } as any);
      
      vi.mocked(maintenanceApi.getAll).mockResolvedValue({
        data: [newRecord],
      } as any);
      
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: '給水器フィルター交換' })).toBeInTheDocument();
      });
      
      // Fill in notes
      const notesTextarea = screen.getByPlaceholderText('メンテナンスの詳細や気づいたことを記録');
      await user.type(notesTextarea, 'テストメモ');
      
      // Click water filter button
      const waterFilterButton = screen.getByRole('button', { name: '給水器フィルター交換' });
      await user.click(waterFilterButton);
      
      await waitFor(() => {
        expect(maintenanceApi.createWaterFilter).toHaveBeenCalled();
        expect(screen.getByText('給水器フィルター交換を記録しました')).toBeInTheDocument();
      });
    });

    it('should create litter box maintenance record successfully', async () => {
      const user = userEvent.setup();
      const newRecord = {
        id: 2,
        type: 'litter_box' as const,
        performedAt: new Date('2024-01-01T11:00:00'),
        notes: '',
        createdAt: new Date(),
      };
      
      vi.mocked(maintenanceApi.createLitterBox).mockResolvedValue({
        data: newRecord,
      } as any);
      
      vi.mocked(maintenanceApi.getAll).mockResolvedValue({
        data: [newRecord],
      } as any);
      
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'トイレ砂交換' })).toBeInTheDocument();
      });
      
      // Click litter box button
      const litterBoxButton = screen.getByRole('button', { name: 'トイレ砂交換' });
      await user.click(litterBoxButton);
      
      await waitFor(() => {
        expect(maintenanceApi.createLitterBox).toHaveBeenCalled();
        expect(screen.getByText('トイレ砂交換を記録しました')).toBeInTheDocument();
      });
    });

    it('should create nail clipping maintenance record successfully', async () => {
      const user = userEvent.setup();
      const newRecord = {
        id: 3,
        type: 'nail_clipping' as const,
        performedAt: new Date('2024-01-01T12:00:00'),
        notes: '',
        createdAt: new Date(),
      };
      
      vi.mocked(maintenanceApi.createNailClipping).mockResolvedValue({
        data: newRecord,
      } as any);
      
      vi.mocked(maintenanceApi.getAll).mockResolvedValue({
        data: [newRecord],
      } as any);
      
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: '爪切り' })).toBeInTheDocument();
      });
      
      // Click nail clipping button
      const nailClippingButton = screen.getByRole('button', { name: '爪切り' });
      await user.click(nailClippingButton);
      
      await waitFor(() => {
        expect(maintenanceApi.createNailClipping).toHaveBeenCalled();
        expect(screen.getByText('爪切りを記録しました')).toBeInTheDocument();
      });
    });

    it('should display error message when record creation fails', async () => {
      const user = userEvent.setup();
      vi.mocked(maintenanceApi.createWaterFilter).mockRejectedValue(new Error('API Error'));
      
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: '給水器フィルター交換' })).toBeInTheDocument();
      });
      
      const waterFilterButton = screen.getByRole('button', { name: '給水器フィルター交換' });
      await user.click(waterFilterButton);
      
      await waitFor(() => {
        expect(screen.getByText('フィルター交換記録の追加に失敗しました')).toBeInTheDocument();
      });
    });

    it('should clear form after successful submission', async () => {
      const user = userEvent.setup();
      const newRecord = {
        id: 1,
        type: 'water_filter' as const,
        performedAt: new Date('2024-01-01T10:00:00'),
        notes: 'テストメモ',
        createdAt: new Date(),
      };
      
      vi.mocked(maintenanceApi.createWaterFilter).mockResolvedValue({
        data: newRecord,
      } as any);
      
      vi.mocked(maintenanceApi.getAll).mockResolvedValue({
        data: [newRecord],
      } as any);
      
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: '給水器フィルター交換' })).toBeInTheDocument();
      });
      
      // Fill in notes
      const notesTextarea = screen.getByPlaceholderText('メンテナンスの詳細や気づいたことを記録');
      await user.type(notesTextarea, 'テストメモ');
      
      // Submit
      const waterFilterButton = screen.getByRole('button', { name: '給水器フィルター交換' });
      await user.click(waterFilterButton);
      
      await waitFor(() => {
        expect(maintenanceApi.createWaterFilter).toHaveBeenCalled();
        // Notes should be cleared
        expect(notesTextarea).toHaveValue('');
      });
    });
  });

  describe('History Display Tests', () => {
    it('should display "no data" message when there are no records', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('メンテナンス記録がありません')).toBeInTheDocument();
      });
    });

    it('should load and display maintenance records', async () => {
      const records = [
        {
          id: 1,
          type: 'water_filter' as const,
          performedAt: new Date('2024-01-01T10:00:00'),
          notes: 'フィルター交換完了',
          createdAt: new Date(),
        },
        {
          id: 2,
          type: 'litter_box' as const,
          performedAt: new Date('2024-01-02T11:00:00'),
          notes: '',
          createdAt: new Date(),
        },
        {
          id: 3,
          type: 'nail_clipping' as const,
          performedAt: new Date('2024-01-03T12:00:00'),
          notes: '爪切り実施',
          createdAt: new Date(),
        },
      ];
      
      vi.mocked(maintenanceApi.getAll).mockResolvedValue({
        data: records,
      } as any);
      
      renderComponent();
      
      await waitFor(() => {
        expect(maintenanceApi.getAll).toHaveBeenCalled();
        expect(screen.getByText('給水器フィルター交換')).toBeInTheDocument();
        expect(screen.getByText('トイレ砂交換')).toBeInTheDocument();
        expect(screen.getByText('爪切り')).toBeInTheDocument();
      });
    });

    it('should display notes when available', async () => {
      const records = [
        {
          id: 1,
          type: 'water_filter' as const,
          performedAt: new Date('2024-01-01T10:00:00'),
          notes: 'フィルター交換完了',
          createdAt: new Date(),
        },
      ];
      
      vi.mocked(maintenanceApi.getAll).mockResolvedValue({
        data: records,
      } as any);
      
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('フィルター交換完了')).toBeInTheDocument();
      });
    });

    it('should display formatted date and time', async () => {
      const records = [
        {
          id: 1,
          type: 'water_filter' as const,
          performedAt: new Date('2024-01-15T14:30:00'),
          notes: '',
          createdAt: new Date(),
        },
      ];
      
      vi.mocked(maintenanceApi.getAll).mockResolvedValue({
        data: records,
      } as any);
      
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('2024/01/15 14:30')).toBeInTheDocument();
      });
    });
  });
});
