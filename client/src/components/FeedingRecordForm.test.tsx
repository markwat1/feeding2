import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { FeedingRecordForm } from './FeedingRecordForm';
import { feedTypeApi, scheduleApi, feedingRecordApi } from '../services/api';

// Mock the API modules
vi.mock('../services/api', () => ({
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
  },
}));

const renderComponent = () => {
  return render(
    <BrowserRouter>
      <FeedingRecordForm />
    </BrowserRouter>
  );
};

describe('FeedingRecordForm', () => {
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

  describe('Form Input and Validation', () => {
    it('should render the form with all required fields', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('餌やり記録')).toBeInTheDocument();
      });
      
      expect(screen.getByText('餌の種類')).toBeInTheDocument();
      expect(screen.getByText('餌やり時刻')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '記録する' })).toBeInTheDocument();
    });

    it('should disable submit button when feed type is not selected', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: '記録する' })).toBeInTheDocument();
      });
      
      const submitButton = screen.getByRole('button', { name: '記録する' });
      expect(submitButton).toBeDisabled();
    });

    it('should enable submit button when all required fields are filled', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('餌の種類を選択')).toBeInTheDocument();
      });
      
      // Select feed type
      const select = screen.getByText('餌の種類を選択').closest('div')?.querySelector('select');
      expect(select).toBeInTheDocument();
      
      if (select) {
        await user.selectOptions(select, '1');
      }
      
      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: '記録する' });
        expect(submitButton).not.toBeDisabled();
      });
    });

    it('should submit form with valid data', async () => {
      const user = userEvent.setup();
      vi.mocked(feedingRecordApi.create).mockResolvedValue({
        data: { id: 1, feedTypeId: 1, feedingTime: new Date(), consumed: null, createdAt: new Date() },
      } as any);
      
      renderComponent();
      
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
      
      await waitFor(() => {
        expect(feedingRecordApi.create).toHaveBeenCalled();
        expect(screen.getByText('餌やり記録を追加しました')).toBeInTheDocument();
      });
    });

    it('should display error message when submission fails', async () => {
      const user = userEvent.setup();
      vi.mocked(feedingRecordApi.create).mockRejectedValue(new Error('API Error'));
      
      renderComponent();
      
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
      
      await waitFor(() => {
        expect(screen.getByText('餌やり記録の追加に失敗しました')).toBeInTheDocument();
      });
    });
  });

  describe('Feed Type Selection', () => {
    it('should load and display feed types from API', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(feedTypeApi.getAll).toHaveBeenCalled();
      });
      
      // Check if feed types are loaded (they appear in the select dropdown)
      const select = screen.getByText('餌の種類を選択').closest('div')?.querySelector('select');
      expect(select).toBeInTheDocument();
    });

    it('should allow selecting a feed type', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('餌の種類を選択')).toBeInTheDocument();
      });
      
      const select = screen.getByText('餌の種類を選択').closest('div')?.querySelector('select');
      expect(select).toBeInTheDocument();
      
      if (select) {
        await user.selectOptions(select, '1');
        expect((select as HTMLSelectElement).value).toBe('1');
      }
    });

    it('should show add new feed type form when button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('新しい餌を追加')).toBeInTheDocument();
      });
      
      const addButton = screen.getByRole('button', { name: '新しい餌を追加' });
      await user.click(addButton);
      
      await waitFor(() => {
        expect(screen.getByText('メーカー名')).toBeInTheDocument();
        expect(screen.getByText('商品名')).toBeInTheDocument();
      });
    });

    it('should add new feed type successfully', async () => {
      const user = userEvent.setup();
      const newFeedType = { id: 3, manufacturer: 'メーカーC', productName: '商品C', createdAt: new Date() };
      vi.mocked(feedTypeApi.create).mockResolvedValue({ data: newFeedType } as any);
      
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('新しい餌を追加')).toBeInTheDocument();
      });
      
      // Click add button
      const addButton = screen.getByRole('button', { name: '新しい餌を追加' });
      await user.click(addButton);
      
      // Fill in the form
      const manufacturerInput = screen.getByPlaceholderText('メーカー名を入力');
      const productNameInput = screen.getByPlaceholderText('商品名を入力');
      
      await user.type(manufacturerInput, 'メーカーC');
      await user.type(productNameInput, '商品C');
      
      // Submit
      const submitButton = screen.getByRole('button', { name: '追加' });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(feedTypeApi.create).toHaveBeenCalledWith('メーカーC', '商品C');
        expect(screen.getByText('餌の種類を追加しました')).toBeInTheDocument();
      });
    });

    it('should not submit new feed type with empty fields', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('新しい餌を追加')).toBeInTheDocument();
      });
      
      // Click add button
      const addButton = screen.getByRole('button', { name: '新しい餌を追加' });
      await user.click(addButton);
      
      // Try to submit without filling fields
      const submitButton = screen.getByRole('button', { name: '追加' });
      await user.click(submitButton);
      
      // API should not be called
      expect(feedTypeApi.create).not.toHaveBeenCalled();
    });
  });

  describe('Previous Consumption Recording', () => {
    it('should display previous unconsumed record when available', async () => {
      const unconsumedRecord = {
        id: 1,
        feedTypeId: 1,
        feedingTime: new Date('2024-01-01T08:00:00'),
        consumed: null,
        createdAt: new Date(),
        feedType: { id: 1, manufacturer: 'メーカーA', productName: '商品A', createdAt: new Date() },
      };
      
      vi.mocked(feedingRecordApi.getLatestUnconsumed).mockResolvedValue({
        data: unconsumedRecord,
      } as any);
      
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('前回の餌の摂食状況を記録してください')).toBeInTheDocument();
        expect(screen.getByText(/メーカーA 商品A/)).toBeInTheDocument();
      });
    });

    it('should update consumption status when "食べきった" button is clicked', async () => {
      const user = userEvent.setup();
      const unconsumedRecord = {
        id: 1,
        feedTypeId: 1,
        feedingTime: new Date('2024-01-01T08:00:00'),
        consumed: null,
        createdAt: new Date(),
        feedType: { id: 1, manufacturer: 'メーカーA', productName: '商品A', createdAt: new Date() },
      };
      
      vi.mocked(feedingRecordApi.getLatestUnconsumed).mockResolvedValue({
        data: unconsumedRecord,
      } as any);
      
      vi.mocked(feedingRecordApi.updateConsumption).mockResolvedValue({
        data: { ...unconsumedRecord, consumed: true },
      } as any);
      
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('前回の餌の摂食状況を記録してください')).toBeInTheDocument();
      });
      
      const consumedButton = screen.getByRole('button', { name: '食べきった' });
      await user.click(consumedButton);
      
      await waitFor(() => {
        expect(feedingRecordApi.updateConsumption).toHaveBeenCalledWith(1, true);
        expect(screen.getByText('前回の摂食状況を記録しました')).toBeInTheDocument();
      });
    });

    it('should update consumption status when "残した" button is clicked', async () => {
      const user = userEvent.setup();
      const unconsumedRecord = {
        id: 1,
        feedTypeId: 1,
        feedingTime: new Date('2024-01-01T08:00:00'),
        consumed: null,
        createdAt: new Date(),
        feedType: { id: 1, manufacturer: 'メーカーA', productName: '商品A', createdAt: new Date() },
      };
      
      vi.mocked(feedingRecordApi.getLatestUnconsumed).mockResolvedValue({
        data: unconsumedRecord,
      } as any);
      
      vi.mocked(feedingRecordApi.updateConsumption).mockResolvedValue({
        data: { ...unconsumedRecord, consumed: false },
      } as any);
      
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('前回の餌の摂食状況を記録してください')).toBeInTheDocument();
      });
      
      const leftoverButton = screen.getByRole('button', { name: '残した' });
      await user.click(leftoverButton);
      
      await waitFor(() => {
        expect(feedingRecordApi.updateConsumption).toHaveBeenCalledWith(1, false);
        expect(screen.getByText('前回の摂食状況を記録しました')).toBeInTheDocument();
      });
    });
  });

  describe('Schedule Time Integration', () => {
    it('should set default time from next unrecorded schedule', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(scheduleApi.getNextUnrecorded).toHaveBeenCalled();
      });
      
      // The time input should be populated with the schedule time
      const timeInputs = screen.getAllByDisplayValue(/08:00/);
      expect(timeInputs.length).toBeGreaterThan(0);
      const timeInput = timeInputs[0] as HTMLInputElement;
      expect(timeInput.type).toBe('datetime-local');
      expect(timeInput.value).toContain('08:00');
    });

    it('should use current time when no schedule is available', async () => {
      vi.mocked(scheduleApi.getNextUnrecorded).mockResolvedValue({
        data: { nextTime: null },
      } as any);
      
      renderComponent();
      
      await waitFor(() => {
        expect(scheduleApi.getNextUnrecorded).toHaveBeenCalled();
      });
      
      // The time input should have some value (current time)
      const allInputs = document.querySelectorAll('input[type="datetime-local"]');
      expect(allInputs.length).toBeGreaterThan(0);
      const timeInput = allInputs[0] as HTMLInputElement;
      expect(timeInput.value).toBeTruthy();
    });
  });
});
