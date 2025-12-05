import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { FeedingRecordForm } from '../../components/FeedingRecordForm';
import { CalendarView } from '../../components/CalendarView';
import { feedTypeApi, scheduleApi, feedingRecordApi } from '../../services/api';

// Mock the API modules
vi.mock('../../services/api', () => ({
  feedTypeApi: {
    getAll: vi.fn(),
    create: vi.fn(),
  },
  scheduleApi: {
    getNextUnrecorded: vi.fn(),
  },
  feedingRecordApi: {
    getLatestUnconsumed: vi.fn(),
    create: vi.fn(),
    updateConsumption: vi.fn(),
    getByDateRange: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  petApi: {
    getAll: vi.fn(),
    getWeights: vi.fn(),
  },
  maintenanceApi: {
    getAll: vi.fn(),
  },
}));

const renderFeedingForm = () => {
  return render(
    <BrowserRouter>
      <FeedingRecordForm />
    </BrowserRouter>
  );
};

const renderCalendar = () => {
  return render(
    <BrowserRouter>
      <CalendarView />
    </BrowserRouter>
  );
};

describe('Feeding Record Flow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementations
    vi.mocked(feedTypeApi.getAll).mockResolvedValue({
      data: [
        { id: 1, manufacturer: 'メーカーA', productName: '商品A', createdAt: new Date() },
        { id: 2, manufacturer: 'メーカーB', productName: '商品B', createdAt: new Date() },
      ],
    } as any);
    
    vi.mocked(scheduleApi.getNextUnrecorded).mockResolvedValue({
      data: { nextTime: '08:00' },
    } as any);
    
    vi.mocked(feedingRecordApi.getLatestUnconsumed).mockResolvedValue({
      data: null,
    } as any);
  });

  describe('Complete Feeding Record to Display Flow', () => {
    it('should create a feeding record and verify it can be displayed', async () => {
      const user = userEvent.setup();
      const now = new Date('2024-01-15T08:00:00');
      const createdRecord = {
        id: 1,
        feedTypeId: 1,
        feedingTime: now,
        consumed: null,
        createdAt: now,
        feedType: { id: 1, manufacturer: 'メーカーA', productName: '商品A', createdAt: now },
      };
      
      vi.mocked(feedingRecordApi.create).mockResolvedValue({
        data: createdRecord,
      } as any);
      
      // Step 1: Create a feeding record
      renderFeedingForm();
      
      await waitFor(() => {
        expect(screen.getByText('餌の種類を選択')).toBeInTheDocument();
      });
      
      // Select feed type
      const select = screen.getByText('餌の種類を選択').closest('div')?.querySelector('select');
      if (select) {
        await user.selectOptions(select, '1');
      }
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: '記録する' });
      await user.click(submitButton);
      
      // Verify record was created
      await waitFor(() => {
        expect(feedingRecordApi.create).toHaveBeenCalled();
        expect(screen.getByText('餌やり記録を追加しました')).toBeInTheDocument();
      });
      
      // Verify the API was called with correct data
      const createCall = vi.mocked(feedingRecordApi.create).mock.calls[0];
      expect(createCall).toBeDefined();
      expect(createCall[0]).toBe(1); // feedTypeId
    });

    it('should handle the complete flow: create record -> update consumption -> verify status', async () => {
      const user = userEvent.setup();
      const now = new Date('2024-01-15T08:00:00');
      const createdRecord = {
        id: 1,
        feedTypeId: 1,
        feedingTime: now,
        consumed: null,
        createdAt: now,
        feedType: { id: 1, manufacturer: 'メーカーA', productName: '商品A', createdAt: now },
      };
      
      // Step 1: Create record
      vi.mocked(feedingRecordApi.create).mockResolvedValue({
        data: createdRecord,
      } as any);
      
      renderFeedingForm();
      
      await waitFor(() => {
        expect(screen.getByText('餌の種類を選択')).toBeInTheDocument();
      });
      
      const select = screen.getByText('餌の種類を選択').closest('div')?.querySelector('select');
      if (select) {
        await user.selectOptions(select, '1');
      }
      
      const submitButton = screen.getByRole('button', { name: '記録する' });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(feedingRecordApi.create).toHaveBeenCalled();
      });
      
      // Step 2: Simulate next visit where previous record needs consumption update
      vi.mocked(feedingRecordApi.getLatestUnconsumed).mockResolvedValue({
        data: createdRecord,
      } as any);
      
      vi.mocked(feedingRecordApi.updateConsumption).mockResolvedValue({
        data: { ...createdRecord, consumed: true },
      } as any);
      
      // Re-render to simulate new visit
      const { unmount } = renderFeedingForm();
      unmount();
      renderFeedingForm();
      
      // Wait for previous record to appear
      await waitFor(() => {
        expect(screen.getByText('前回の餌の摂食状況を記録してください')).toBeInTheDocument();
      });
      
      // Update consumption status
      const consumedButton = screen.getByRole('button', { name: '食べきった' });
      await user.click(consumedButton);
      
      await waitFor(() => {
        expect(feedingRecordApi.updateConsumption).toHaveBeenCalledWith(1, true);
        expect(screen.getByText('前回の摂食状況を記録しました')).toBeInTheDocument();
      });
    });

    it('should handle multiple feeding records in sequence', async () => {
      const user = userEvent.setup();
      const records = [
        {
          id: 1,
          feedTypeId: 1,
          feedingTime: new Date('2024-01-15T08:00:00'),
          consumed: null,
          createdAt: new Date(),
          feedType: { id: 1, manufacturer: 'メーカーA', productName: '商品A', createdAt: new Date() },
        },
        {
          id: 2,
          feedTypeId: 2,
          feedingTime: new Date('2024-01-15T18:00:00'),
          consumed: null,
          createdAt: new Date(),
          feedType: { id: 2, manufacturer: 'メーカーB', productName: '商品B', createdAt: new Date() },
        },
      ];
      
      // Create first record
      vi.mocked(feedingRecordApi.create).mockResolvedValueOnce({
        data: records[0],
      } as any);
      
      renderFeedingForm();
      
      await waitFor(() => {
        expect(screen.getByText('餌の種類を選択')).toBeInTheDocument();
      });
      
      let select = screen.getByText('餌の種類を選択').closest('div')?.querySelector('select');
      if (select) {
        await user.selectOptions(select, '1');
      }
      
      let submitButton = screen.getByRole('button', { name: '記録する' });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(feedingRecordApi.create).toHaveBeenCalledTimes(1);
      });
      
      // Create second record
      vi.mocked(feedingRecordApi.create).mockResolvedValueOnce({
        data: records[1],
      } as any);
      
      // Wait for form to reset
      await waitFor(() => {
        select = screen.getByText('餌の種類を選択').closest('div')?.querySelector('select');
        expect(select).toBeInTheDocument();
      });
      
      if (select) {
        await user.selectOptions(select, '2');
      }
      
      submitButton = screen.getByRole('button', { name: '記録する' });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(feedingRecordApi.create).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Error Handling in Complete Flow', () => {
    it('should handle API errors gracefully during record creation', async () => {
      const user = userEvent.setup();
      vi.mocked(feedingRecordApi.create).mockRejectedValue(new Error('Network error'));
      
      renderFeedingForm();
      
      await waitFor(() => {
        expect(screen.getByText('餌の種類を選択')).toBeInTheDocument();
      });
      
      const select = screen.getByText('餌の種類を選択').closest('div')?.querySelector('select');
      if (select) {
        await user.selectOptions(select, '1');
      }
      
      const submitButton = screen.getByRole('button', { name: '記録する' });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('餌やり記録の追加に失敗しました')).toBeInTheDocument();
      });
    });

    it('should handle API errors during consumption update', async () => {
      const user = userEvent.setup();
      const unconsumedRecord = {
        id: 1,
        feedTypeId: 1,
        feedingTime: new Date('2024-01-15T08:00:00'),
        consumed: null,
        createdAt: new Date(),
        feedType: { id: 1, manufacturer: 'メーカーA', productName: '商品A', createdAt: new Date() },
      };
      
      vi.mocked(feedingRecordApi.getLatestUnconsumed).mockResolvedValue({
        data: unconsumedRecord,
      } as any);
      
      vi.mocked(feedingRecordApi.updateConsumption).mockRejectedValue(new Error('Update failed'));
      
      renderFeedingForm();
      
      await waitFor(() => {
        expect(screen.getByText('前回の餌の摂食状況を記録してください')).toBeInTheDocument();
      });
      
      const consumedButton = screen.getByRole('button', { name: '食べきった' });
      await user.click(consumedButton);
      
      await waitFor(() => {
        expect(screen.getByText('摂食状況の更新に失敗しました')).toBeInTheDocument();
      });
    });
  });
});
