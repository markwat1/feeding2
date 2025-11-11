import React, { useState, useEffect } from 'react';
import { Button } from './common/Button';
import { Input } from './common/Input';
import { WeightChart } from './common/WeightChart';
import { PeriodSelector, TimePeriod } from './common/PeriodSelector';
import { petApi, weightRecordApi } from '../services/api';
import { Pet, WeightRecord } from '../types';
import { format } from 'date-fns';
import { filterWeightRecordsByPeriod } from '../utils/dateUtils';
import styles from './PetManagement.module.css';

export const PetManagement: React.FC = () => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [weightRecords, setWeightRecords] = useState<WeightRecord[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('6months');
  const [chartLoading, setChartLoading] = useState(false);
  const [newPetName, setNewPetName] = useState('');
  const [newWeight, setNewWeight] = useState('');
  const [measureDate, setMeasureDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [editingPet, setEditingPet] = useState<{ id: number; name: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadPets();
  }, []);

  useEffect(() => {
    if (selectedPet) {
      loadWeightRecords(selectedPet.id);
    }
  }, [selectedPet]);

  // Handle period change for chart
  const handlePeriodChange = (period: TimePeriod) => {
    setSelectedPeriod(period);
  };

  // Get filtered weight records for chart
  const getFilteredWeightRecords = (): WeightRecord[] => {
    return filterWeightRecordsByPeriod(weightRecords, selectedPeriod);
  };

  const loadPets = async () => {
    try {
      const response = await petApi.getAll();
      setPets(response.data);
      if (response.data.length > 0 && !selectedPet) {
        setSelectedPet(response.data[0]);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'ペット一覧の読み込みに失敗しました' });
    }
  };

  const loadWeightRecords = async (petId: number) => {
    try {
      const response = await weightRecordApi.getByPet(petId);
      setWeightRecords(response.data);
    } catch (error) {
      setMessage({ type: 'error', text: '体重記録の読み込みに失敗しました' });
    }
  };

  const handleAddPet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPetName.trim()) return;

    try {
      setLoading(true);
      const response = await petApi.create(newPetName.trim());
      setPets([...pets, response.data]);
      setNewPetName('');
      setMessage({ type: 'success', text: 'ペットを追加しました' });
    } catch (error) {
      setMessage({ type: 'error', text: 'ペットの追加に失敗しました' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePet = async (id: number, name: string) => {
    if (!name.trim()) return;

    try {
      setLoading(true);
      const response = await petApi.update(id, name.trim());
      setPets(pets.map(p => p.id === id ? response.data : p));
      if (selectedPet?.id === id) {
        setSelectedPet(response.data);
      }
      setEditingPet(null);
      setMessage({ type: 'success', text: 'ペット情報を更新しました' });
    } catch (error) {
      setMessage({ type: 'error', text: 'ペット情報の更新に失敗しました' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePet = async (id: number) => {
    const petToDelete = pets.find(p => p.id === id);
    if (!petToDelete) return;
    
    if (!confirm(`「${petToDelete.name}」を削除しますか？関連する体重記録もすべて削除されます。`)) return;

    try {
      setLoading(true);
      await petApi.delete(id);
      setPets(pets.filter(p => p.id !== id));
      if (selectedPet?.id === id) {
        setSelectedPet(pets.find(p => p.id !== id) || null);
        setWeightRecords([]);
      }
      setMessage({ type: 'success', text: 'ペットを削除しました' });
    } catch (error) {
      setMessage({ type: 'error', text: 'ペットの削除に失敗しました' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPet || !newWeight || !measureDate) return;

    const weight = parseFloat(newWeight);
    if (isNaN(weight) || weight <= 0) {
      setMessage({ type: 'error', text: '正しい体重を入力してください' });
      return;
    }

    try {
      setLoading(true);
      await weightRecordApi.create(selectedPet.id, weight, measureDate);
      await loadWeightRecords(selectedPet.id);
      setNewWeight('');
      setMeasureDate(format(new Date(), 'yyyy-MM-dd'));
      setMessage({ type: 'success', text: '体重記録を追加しました' });
    } catch (error) {
      setMessage({ type: 'error', text: '体重記録の追加に失敗しました' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2>ペット管理</h2>

      {message && (
        <div className={`${styles.message} ${styles[message.type]}`}>
          {message.text}
        </div>
      )}

      {/* ペット追加 */}
      <div className={styles.card}>
        <h3>新しいペットを追加</h3>
        <form onSubmit={handleAddPet} className={styles.form}>
          <div className={styles.formGroup}>
            <Input
              value={newPetName}
              onChange={setNewPetName}
              placeholder="ペットの名前"
              required
            />
          </div>
          <Button type="submit" disabled={loading || !newPetName.trim()}>
            追加
          </Button>
        </form>
      </div>

      {/* ペット選択 */}
      {pets.length > 0 && (
        <div className={styles.card}>
          <h3>ペット一覧</h3>
          <div className={styles.petList}>
            {pets.map(pet => (
              <div key={pet.id} className={styles.petItem}>
                {editingPet?.id === pet.id ? (
                  <div className={styles.editForm}>
                    <Input
                      value={editingPet.name}
                      onChange={(value) => setEditingPet({ ...editingPet, name: value })}
                      placeholder="ペット名"
                    />
                    <div className={styles.editButtons}>
                      <Button
                        onClick={() => handleUpdatePet(editingPet.id, editingPet.name)}
                        disabled={loading}
                      >
                        保存
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => setEditingPet(null)}
                      >
                        キャンセル
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => setSelectedPet(pet)}
                      className={`${styles.petButton} ${
                        selectedPet?.id === pet.id ? styles.selected : ''
                      }`}
                    >
                      {pet.name}
                    </button>
                    <div className={styles.petActions}>
                      <Button
                        variant="secondary"
                        onClick={() => setEditingPet({ id: pet.id, name: pet.name })}
                        className={styles.actionButton}
                      >
                        編集
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleDeletePet(pet.id)}
                        className={styles.actionButton}
                      >
                        削除
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 体重記録 */}
      {selectedPet && (
        <div className={styles.card}>
          <h3>{selectedPet.name}の体重記録</h3>
          
          <form onSubmit={handleAddWeight} className={styles.form}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>体重 (kg)</label>
                <Input
                  type="number"
                  value={newWeight}
                  onChange={setNewWeight}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>測定日</label>
                <Input
                  type="date"
                  value={measureDate}
                  onChange={setMeasureDate}
                  required
                />
              </div>
            </div>
            <Button type="submit" disabled={loading || !newWeight || !measureDate}>
              記録
            </Button>
          </form>

          {/* 体重履歴 */}
          <div className={styles.weightHistory}>
            <h4>体重履歴</h4>
            {weightRecords.length === 0 ? (
              <p className={styles.noData}>体重記録がありません</p>
            ) : (
              <div className={styles.recordList}>
                {weightRecords.map(record => (
                  <div key={record.id} className={styles.recordItem}>
                    <span className={styles.date}>
                      {format(new Date(record.measuredDate), 'yyyy/MM/dd')}
                    </span>
                    <span className={styles.weight}>{record.weight}kg</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 体重グラフ */}
          <div className={styles.weightChart}>
            <h4>体重推移グラフ</h4>
            <PeriodSelector
              selectedPeriod={selectedPeriod}
              onPeriodChange={handlePeriodChange}
              disabled={loading || chartLoading}
            />
            <WeightChart
              weightRecords={getFilteredWeightRecords()}
              petName={selectedPet.name}
              loading={chartLoading}
            />
          </div>
        </div>
      )}
    </div>
  );
};