import React, { useState, useEffect } from 'react';
import { Button } from './common/Button';
import { Input } from './common/Input';
import { Select } from './common/Select';
import { feedingRecordApi, feedTypeApi } from '../services/api';
import { FeedingRecord, FeedType } from '../types';
import { format } from 'date-fns';
import styles from './FeedingHistory.module.css';

export const FeedingHistory: React.FC = () => {
  const [records, setRecords] = useState<FeedingRecord[]>([]);
  const [feedTypes, setFeedTypes] = useState<FeedType[]>([]);
  const [editingRecord, setEditingRecord] = useState<{
    id: number;
    feedTypeId: number;
    feedingTime: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [recordsResponse, feedTypesResponse] = await Promise.all([
        feedingRecordApi.getAll(),
        feedTypeApi.getAll()
      ]);
      setRecords(recordsResponse.data);
      setFeedTypes(feedTypesResponse.data);
    } catch (error) {
      setMessage({ type: 'error', text: 'データの読み込みに失敗しました' });
    }
  };

  const handleUpdateRecord = async (id: number, feedTypeId: number, feedingTime: string) => {
    try {
      setLoading(true);
      const response = await feedingRecordApi.update(id, feedTypeId, feedingTime);
      setRecords(records.map(r => r.id === id ? response.data : r));
      setEditingRecord(null);
      setMessage({ type: 'success', text: '餌やり記録を更新しました' });
    } catch (error) {
      setMessage({ type: 'error', text: '餌やり記録の更新に失敗しました' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecord = async (id: number) => {
    const recordToDelete = records.find(r => r.id === id);
    if (!recordToDelete) return;
    
    if (!confirm(`${format(new Date(recordToDelete.feedingTime), 'yyyy/MM/dd HH:mm')}の餌やり記録を削除しますか？`)) return;

    try {
      setLoading(true);
      await feedingRecordApi.delete(id);
      setRecords(records.filter(r => r.id !== id));
      setMessage({ type: 'success', text: '餌やり記録を削除しました' });
    } catch (error) {
      setMessage({ type: 'error', text: '餌やり記録の削除に失敗しました' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleConsumption = async (id: number, consumed: boolean | null) => {
    const newConsumed = consumed === null ? true : !consumed;
    
    try {
      setLoading(true);
      const response = await feedingRecordApi.updateConsumption(id, newConsumed);
      setRecords(records.map(r => r.id === id ? response.data : r));
      setMessage({ type: 'success', text: '摂食状況を更新しました' });
    } catch (error) {
      setMessage({ type: 'error', text: '摂食状況の更新に失敗しました' });
    } finally {
      setLoading(false);
    }
  };

  const feedTypeOptions = feedTypes.map(ft => ({
    value: ft.id,
    label: `${ft.manufacturer} - ${ft.productName}`
  }));

  return (
    <div className={styles.container}>
      <h2>餌やり記録履歴</h2>

      {message && (
        <div className={`${styles.message} ${styles[message.type]}`}>
          {message.text}
        </div>
      )}

      <div className={styles.card}>
        {records.length === 0 ? (
          <p className={styles.noData}>餌やり記録がありません</p>
        ) : (
          <div className={styles.recordList}>
            {records.map((record) => (
              <div key={record.id} className={styles.recordItem}>
                {editingRecord?.id === record.id ? (
                  <div className={styles.editForm}>
                    <div className={styles.editFields}>
                      <div className={styles.fieldGroup}>
                        <label>餌の種類</label>
                        <Select
                          value={editingRecord.feedTypeId}
                          onChange={(value) => setEditingRecord({ 
                            ...editingRecord, 
                            feedTypeId: parseInt(value) 
                          })}
                          options={feedTypeOptions}
                        />
                      </div>
                      <div className={styles.fieldGroup}>
                        <label>時刻</label>
                        <Input
                          type="datetime-local"
                          value={editingRecord.feedingTime}
                          onChange={(value) => setEditingRecord({ 
                            ...editingRecord, 
                            feedingTime: value 
                          })}
                        />
                      </div>
                    </div>
                    <div className={styles.editButtons}>
                      <Button
                        onClick={() => handleUpdateRecord(
                          editingRecord.id, 
                          editingRecord.feedTypeId, 
                          editingRecord.feedingTime
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
                    <div className={styles.recordInfo}>
                      <div className={styles.datetime}>
                        {format(new Date(record.feedingTime), 'yyyy/MM/dd HH:mm')}
                      </div>
                      <div className={styles.feedType}>
                        {record.feedType?.manufacturer} - {record.feedType?.productName}
                      </div>
                      <div 
                        className={`${styles.consumption} ${
                          record.consumed === true ? styles.consumed : 
                          record.consumed === false ? styles.notConsumed : styles.unknown
                        }`}
                        onClick={() => handleToggleConsumption(record.id, record.consumed)}
                        title="クリックで摂食状況を切り替え"
                      >
                        {record.consumed === true ? '完食' : 
                         record.consumed === false ? '残食' : '未記録'}
                      </div>
                    </div>
                    <div className={styles.recordActions}>
                      <Button
                        variant="secondary"
                        onClick={() => setEditingRecord({
                          id: record.id,
                          feedTypeId: record.feedTypeId,
                          feedingTime: format(new Date(record.feedingTime), "yyyy-MM-dd'T'HH:mm")
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