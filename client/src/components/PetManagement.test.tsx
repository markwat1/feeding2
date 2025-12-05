import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { PetManagement } from './PetManagement';
import { petApi, weightRecordApi } from '../services/api';

// Mock the API modules
vi.mock('../services/api', () => ({
  petApi: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  weightRecordApi: {
    getByPet: vi.fn(),
    create: vi.fn(),
  },
}));

const renderComponent = () => {
  return render(
    <BrowserRouter>
      <PetManagement />
    </BrowserRouter>
  );
};

describe('PetManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementations
    vi.mocked(petApi.getAll).mockResolvedValue({
      data: [
        { id: 1, name: 'ミケ', createdAt: new Date('2024-01-01') },
        { id: 2, name: 'タマ', createdAt: new Date('2024-01-02') },
      ],
    } as any);
    
    vi.mocked(weightRecordApi.getByPet).mockResolvedValue({
      data: [],
    } as any);
  });

  describe('Pet Registration Form', () => {
    it('should render the pet registration form', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('ペット管理')).toBeInTheDocument();
      });
      
      expect(screen.getByText('新しいペットを追加')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('ペットの名前')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '追加' })).toBeInTheDocument();
    });

    it('should disable submit button when pet name is empty', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: '追加' })).toBeInTheDocument();
      });
      
      const submitButton = screen.getByRole('button', { name: '追加' });
      expect(submitButton).toBeDisabled();
    });

    it('should enable submit button when pet name is entered', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('ペットの名前')).toBeInTheDocument();
      });
      
      const nameInput = screen.getByPlaceholderText('ペットの名前');
      await user.type(nameInput, 'シロ');
      
      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: '追加' });
        expect(submitButton).not.toBeDisabled();
      });
    });

    it('should successfully add a new pet', async () => {
      const user = userEvent.setup();
      const newPet = { id: 3, name: 'シロ', createdAt: new Date() };
      vi.mocked(petApi.create).mockResolvedValue({ data: newPet } as any);
      
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('ペットの名前')).toBeInTheDocument();
      });
      
      const nameInput = screen.getByPlaceholderText('ペットの名前');
      await user.type(nameInput, 'シロ');
      
      const submitButton = screen.getByRole('button', { name: '追加' });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(petApi.create).toHaveBeenCalledWith('シロ');
        expect(screen.getByText('ペットを追加しました')).toBeInTheDocument();
      });
    });

    it('should display error message when pet creation fails', async () => {
      const user = userEvent.setup();
      vi.mocked(petApi.create).mockRejectedValue(new Error('API Error'));
      
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('ペットの名前')).toBeInTheDocument();
      });
      
      const nameInput = screen.getByPlaceholderText('ペットの名前');
      await user.type(nameInput, 'シロ');
      
      const submitButton = screen.getByRole('button', { name: '追加' });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('ペットの追加に失敗しました')).toBeInTheDocument();
      });
    });

    it('should clear input field after successful pet creation', async () => {
      const user = userEvent.setup();
      const newPet = { id: 3, name: 'シロ', createdAt: new Date() };
      vi.mocked(petApi.create).mockResolvedValue({ data: newPet } as any);
      
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('ペットの名前')).toBeInTheDocument();
      });
      
      const nameInput = screen.getByPlaceholderText('ペットの名前') as HTMLInputElement;
      await user.type(nameInput, 'シロ');
      
      const submitButton = screen.getByRole('button', { name: '追加' });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(nameInput.value).toBe('');
      });
    });
  });

  describe('Weight Record Input Validation', () => {
    beforeEach(() => {
      vi.mocked(weightRecordApi.getByPet).mockResolvedValue({
        data: [
          { id: 1, petId: 1, weight: 4.25, measuredDate: new Date('2024-01-15'), createdAt: new Date() },
          { id: 2, petId: 1, weight: 4.10, measuredDate: new Date('2024-01-01'), createdAt: new Date() },
        ],
      } as any);
    });

    it('should render weight recording form when a pet is selected', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('ミケの体重記録')).toBeInTheDocument();
      });
      
      expect(screen.getByText('体重 (kg)')).toBeInTheDocument();
      expect(screen.getByText('測定日')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '記録' })).toBeInTheDocument();
    });

    it('should accept weight input with 2 decimal places', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('ミケの体重記録')).toBeInTheDocument();
      });
      
      const weightInput = screen.getByPlaceholderText('0.00') as HTMLInputElement;
      await user.type(weightInput, '4.25');
      
      expect(weightInput.value).toBe('4.25');
    });

    it('should have step attribute set to 0.01 for 2 decimal precision', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('ミケの体重記録')).toBeInTheDocument();
      });
      
      const weightInput = screen.getByPlaceholderText('0.00') as HTMLInputElement;
      expect(weightInput.step).toBe('0.01');
      expect(weightInput.type).toBe('number');
    });

    it('should disable submit button when weight is empty', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('ミケの体重記録')).toBeInTheDocument();
      });
      
      const submitButton = screen.getByRole('button', { name: '記録' });
      expect(submitButton).toBeDisabled();
    });

    it('should successfully record weight with valid input', async () => {
      const user = userEvent.setup();
      const newWeightRecord = {
        id: 3,
        petId: 1,
        weight: 4.35,
        measuredDate: new Date('2024-01-20'),
        createdAt: new Date(),
      };
      
      vi.mocked(weightRecordApi.create).mockResolvedValue({ data: newWeightRecord } as any);
      
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('ミケの体重記録')).toBeInTheDocument();
      });
      
      const weightInput = screen.getByPlaceholderText('0.00');
      await user.type(weightInput, '4.35');
      
      const submitButton = screen.getByRole('button', { name: '記録' });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(weightRecordApi.create).toHaveBeenCalledWith(1, 4.35, expect.any(String));
        expect(screen.getByText('体重記録を追加しました')).toBeInTheDocument();
      });
    });

    it('should display error message for invalid weight input', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('ミケの体重記録')).toBeInTheDocument();
      });
      
      const weightInput = screen.getByPlaceholderText('0.00');
      await user.clear(weightInput);
      await user.type(weightInput, '0');
      
      const submitButton = screen.getByRole('button', { name: '記録' });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('正しい体重を入力してください')).toBeInTheDocument();
      });
    });

    it('should clear weight input after successful recording', async () => {
      const user = userEvent.setup();
      const newWeightRecord = {
        id: 3,
        petId: 1,
        weight: 4.35,
        measuredDate: new Date('2024-01-20'),
        createdAt: new Date(),
      };
      
      vi.mocked(weightRecordApi.create).mockResolvedValue({ data: newWeightRecord } as any);
      
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('ミケの体重記録')).toBeInTheDocument();
      });
      
      const weightInput = screen.getByPlaceholderText('0.00') as HTMLInputElement;
      await user.type(weightInput, '4.35');
      
      const submitButton = screen.getByRole('button', { name: '記録' });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(weightInput.value).toBe('');
      });
    });

    it('should display weight history in descending order by date', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('体重履歴')).toBeInTheDocument();
      });
      
      // Find weight values specifically (not the label)
      const weightElements = screen.getAllByText(/^\d+\.\d+kg$/);
      expect(weightElements[0]).toHaveTextContent('4.25kg');
      expect(weightElements[1]).toHaveTextContent('4.1kg');
    });

    it('should display "no data" message when no weight records exist', async () => {
      vi.mocked(weightRecordApi.getByPet).mockResolvedValue({
        data: [],
      } as any);
      
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('体重履歴')).toBeInTheDocument();
      });
      
      expect(screen.getByText('体重記録がありません')).toBeInTheDocument();
    });
  });

  describe('Pet List Display', () => {
    it('should display list of pets', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('ペット一覧')).toBeInTheDocument();
      });
      
      expect(screen.getByText('ミケ')).toBeInTheDocument();
      expect(screen.getByText('タマ')).toBeInTheDocument();
    });

    it('should select first pet by default', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('ミケの体重記録')).toBeInTheDocument();
      });
      
      expect(weightRecordApi.getByPet).toHaveBeenCalledWith(1);
    });

    it('should switch selected pet when clicking on pet button', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('ミケ')).toBeInTheDocument();
      });
      
      const tamaButton = screen.getByText('タマ');
      await user.click(tamaButton);
      
      await waitFor(() => {
        expect(screen.getByText('タマの体重記録')).toBeInTheDocument();
        expect(weightRecordApi.getByPet).toHaveBeenCalledWith(2);
      });
    });
  });

  describe('Pet Editing', () => {
    it('should show edit form when edit button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('ミケ')).toBeInTheDocument();
      });
      
      const editButtons = screen.getAllByRole('button', { name: '編集' });
      await user.click(editButtons[0]);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: '保存' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'キャンセル' })).toBeInTheDocument();
      });
    });

    it('should update pet name successfully', async () => {
      const user = userEvent.setup();
      const updatedPet = { id: 1, name: 'ミケちゃん', createdAt: new Date('2024-01-01') };
      vi.mocked(petApi.update).mockResolvedValue({ data: updatedPet } as any);
      
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('ミケ')).toBeInTheDocument();
      });
      
      const editButtons = screen.getAllByRole('button', { name: '編集' });
      await user.click(editButtons[0]);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: '保存' })).toBeInTheDocument();
      });
      
      const inputs = screen.getAllByPlaceholderText('ペット名');
      const nameInput = inputs[0];
      await user.clear(nameInput);
      await user.type(nameInput, 'ミケちゃん');
      
      const saveButton = screen.getByRole('button', { name: '保存' });
      await user.click(saveButton);
      
      await waitFor(() => {
        expect(petApi.update).toHaveBeenCalledWith(1, 'ミケちゃん');
        expect(screen.getByText('ペット情報を更新しました')).toBeInTheDocument();
      });
    });

    it('should cancel editing when cancel button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('ミケ')).toBeInTheDocument();
      });
      
      const editButtons = screen.getAllByRole('button', { name: '編集' });
      await user.click(editButtons[0]);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'キャンセル' })).toBeInTheDocument();
      });
      
      const cancelButton = screen.getByRole('button', { name: 'キャンセル' });
      await user.click(cancelButton);
      
      await waitFor(() => {
        expect(screen.queryByRole('button', { name: '保存' })).not.toBeInTheDocument();
      });
    });
  });

  describe('Pet Deletion', () => {
    it('should show confirmation dialog when delete button is clicked', async () => {
      const user = userEvent.setup();
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
      
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('ミケ')).toBeInTheDocument();
      });
      
      const deleteButtons = screen.getAllByRole('button', { name: '削除' });
      await user.click(deleteButtons[0]);
      
      expect(confirmSpy).toHaveBeenCalledWith(expect.stringContaining('ミケ'));
      confirmSpy.mockRestore();
    });

    it('should delete pet when confirmed', async () => {
      const user = userEvent.setup();
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      vi.mocked(petApi.delete).mockResolvedValue({} as any);
      
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('ミケ')).toBeInTheDocument();
      });
      
      const deleteButtons = screen.getAllByRole('button', { name: '削除' });
      await user.click(deleteButtons[0]);
      
      await waitFor(() => {
        expect(petApi.delete).toHaveBeenCalledWith(1);
        expect(screen.getByText('ペットを削除しました')).toBeInTheDocument();
      });
      
      confirmSpy.mockRestore();
    });

    it('should not delete pet when cancelled', async () => {
      const user = userEvent.setup();
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
      
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('ミケ')).toBeInTheDocument();
      });
      
      const deleteButtons = screen.getAllByRole('button', { name: '削除' });
      await user.click(deleteButtons[0]);
      
      expect(petApi.delete).not.toHaveBeenCalled();
      confirmSpy.mockRestore();
    });
  });
});
