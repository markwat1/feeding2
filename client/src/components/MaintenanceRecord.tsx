import React, { useState, useEffect } from 'react';
import { Button } from './common/Button';
import { Input } from './common/Input';
import { maintenanceApi } from '../services/api';
import { MaintenanceRecord as MaintenanceRecordType } from '../types';
import { format } from 'date-fns';
import styles from './MaintenanceRecord.module.css';

export const MaintenanceRecord: React.FC = () => {
  const [records, setRecords] = useState<MaintenanceRecordType[]>([]);
  const [performedAt, setPerformedAt] = useState(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
  const [notes, setNotes] = useState('');
  const [editingRecord, setEditingRecord] = useState<{
    id: number;
    type: 'water_filter' | 'litter_box';
    performedAt: string;
    notes: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      const response = await maintenanceApi.getAll();
      setRecords(response.data);
    } catch (error) {
      setMessage({ type: 'error', text: 'メンテナンス記録の読み込みに失敗しました' });
    }
  };

  const handleWaterFilterMaintenance = async () => {
    try {
      setLoading(true);
      await maintenanceApi.createWaterFilter(performedAt, notes);
      await loadRecords();
      setNotes('');
      setPerformedAt(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
      setMessage({ type: 'success', text: '給水器フィルター交換を記録しました' });
    } catch (error) {
      setMessage({ type: 'error', text: 'フィルター交換記録の追加に失敗しました' });
    } finally {
      setLoading(false);
    }
  };

  const handleLitterBoxMaintenance = async () => {
    try {
      setLoading(true);
      await maintenanceApi.createLitterBox(performedAt, notes);
      await loadRecords();
      setNotes('');
      setPerformedAt(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
      setMessage({ type: 'success', text: 'トイレ砂交換を記録しました' });
    } catch (error) {
      setMessage({ type: 'error', text: 'トイレ砂交換記録の追加に失敗しました' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRecord = async (id: number, type: 'water_filter' | 'litter_box', performedAt: string, notes: string) => {
    try {
      setLoading(true);
      const response = await maintenanceApi.update(id, type, performedAt, notes);
      setRecords(records.map(r => r.id === id ? response.data : r));
      setEditingRecord(null);
      setMessage({ type: 'success', text: 'メンテナンス記録を更新しました' });
    } catch (error) {
      setMessage({ type: 'error', text: 'メンテナンス記録の更新に失敗しました' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecord = async (id: number) => {
    const recordToDelete = records.find(r => r.id === id);
    if (!recordToDelete) return;
    
    if (!confirm(`${format(new Date(recordToDelete.performedAt), 'yyyy/MM/dd HH:mm')}のメンテナンス記録を削除しますか？`)) return;

    try {
      setLoading(true);
      await maintenanceApi.delete(id);
      setRecords(records.filter(r => r.id !== id));
      setMessage({ type: 'success', text: 'メンテナンス記録を削除しました' });
    } catch (error) {
      setMessage({ type: 'error', text: 'メンテナンス記録の削除に失敗しました' });
    } finally {
      setLoading(false);
    }
  };

  const getMaintenanceTypeLabel = (type: string) => {
    switch (type) {
      case 'water_filter':
        return '給水器フィルター交換';
      case 'litter_box':
        return 'トイレ砂交換';
      default:
        return type;
    }
  };

  return (
    <div className={styles.container}>
      <h2>メンテナンス記録</h2>

      {message && (
        <div className={`${styles.message} ${styles[message.type]}`}>
          {message.text}
        </div>
      )}

      {/* メンテナンス記録フォーム */}
      <div className={styles.card}>
        <h3>メンテナンス実施記録</h3>
        
        <div className={styles.formGroup}>
          <label>実施日時</label>
          <Input
            type="datetime-local"
            value={performedAt}
            onChange={setPerformedAt}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>メモ（任意）</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="メンテナンスの詳細や気づいたことを記録"
            className={styles.textarea}
            rows={3}
          />
        </div>

        <div className={styles.buttonGroup}>
          <Button
            onClick={handleWaterFilterMaintenance}
            disabled={loading || !performedAt}
          >
            給水器フィルター交換
          </Button>
          <Button
            onClick={handleLitterBoxMaintenance}
            disabled={loading || !performedAt}
            variant="secondary"
          >
            トイレ砂交換
          </Button>
        </div>
      </div>

      {/* メンテナンス履歴 */}
      <div className={styles.card}>
        <h3>メンテナンス履歴</h3>
        {records.length === 0 ? (
          <p className={styles.noData}>メンテナンス記録がありません</p>
        ) : (
          <div className={styles.recordList}>
            {records.map(record => (
              <div key={record.id} className={styles.recordItem}>
                {editingRecord?.id === record.id ? (
                  <div className={styles.editForm}>
                    <div className={styles.editFields}>
                      <div className={styles.fieldGroup}>
                        <label>種類</label>
                        <select
                          value={editingRecord.type}
                          onChange={(e) => setEditingRecord({ 
                            ...editingRecord, 
                            type: e.target.value as 'water_filter' | 'litter_box'
                          })}
                          className={styles.select}
                        >
                          <option value="water_filter">給水器フィルター交換</option>
                          <option value="litter_box">トイレ砂交換</option>
                        </select>
                      </div>
                      <div className={styles.fieldGroup}>
                        <label>実施日時</label>
                        <Input
                          type="datetime-local"
                          value={editingRecord.performedAt}
                          onChange={(value) => setEditingRecord({ 
                            ...editingRecord, 
                            performedAt: value 
                          })}
                        />
                      </div>
                      <div className={styles.fieldGroup}>
                        <label>メモ</label>
                        <textarea
                          value={editingRecord.notes}
                          onChange={(e) => setEditingRecord({ 
                            ...editingRecord, 
                            notes: e.target.value 
                          })}
                          className={styles.textarea}
                          rows={2}
                        />
                      </div>
                    </div>
                    <div className={styles.editButtons}>
                      <Button
                        onClick={() => handleUpdateRecord(
                          editingRecord.id,
                          editingRecord.type,
                          editingRecord.performedAt,
                          editingRecord.notes
                        )}
                        disabled={loading}
                      >
                        保存
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => setEditingRecord(null)}
                      >
                        キャンセル
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className={styles.recordHeader}>
                      <span className={styles.type}>
                        {getMaintenanceTypeLabel(record.type)}
                      </span>
                      <span className={styles.date}>
                        {format(new Date(record.performedAt), 'yyyy/MM/dd HH:mm')}
                      </span>
                      <div className={styles.recordActions}>
                        <Button
                          variant="secondary"
                          onClick={() => setEditingRecord({
                            id: record.id,
                            type: record.type,
                            performedAt: format(new Date(record.performedAt), "yyyy-MM-dd'T'HH:mm"),
                            notes: record.notes || ''
                          })}
                          className={styles.actionButton}
                        >
                          編集
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => handleDeleteRecord(record.id)}
                          className={styles.actionButton}
                        >
                          削除
                        </Button>
                      </div>
                    </div>
                    {record.notes && (
                      <div className={styles.notes}>
                        {record.notes}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};