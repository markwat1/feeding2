import React, { useState, useEffect } from 'react';
import { feedingRecordApi, weightRecordApi, maintenanceApi, feedTypeApi } from '../services/api';
import { FeedingRecord, WeightRecord, MaintenanceRecord, FeedType } from '../types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, startOfWeek, endOfWeek, parseISO, formatISO } from 'date-fns';
import { Button } from './common/Button';
import { Input } from './common/Input';
import { Select } from './common/Select';
import styles from './CalendarView.module.css';

export const CalendarView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [feedingRecords, setFeedingRecords] = useState<FeedingRecord[]>([]);
  const [weightRecords, setWeightRecords] = useState<WeightRecord[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<{
    id: number;
    feedTypeId: number;
    feedingTime: string;
  } | null>(null);
  const [editingMaintenanceRecord, setEditingMaintenanceRecord] = useState<MaintenanceRecord | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [feedTypes, setFeedTypes] = useState<FeedType[]>([]);

  useEffect(() => {
    loadMonthData();
  }, [currentDate]);

  const loadMonthData = async () => {
    try {
      setLoading(true);
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      
      // JST時間を考慮して、前日の15:00 UTC（JST 00:00）から翌日の14:59 UTC（JST 23:59）まで取得
      const adjustedStart = new Date(start);
      adjustedStart.setDate(adjustedStart.getDate() - 1);
      const adjustedEnd = new Date(end);
      adjustedEnd.setDate(adjustedEnd.getDate() + 1);
      
      const startStr = format(adjustedStart, 'yyyy-MM-dd');
      const endStr = format(adjustedEnd, 'yyyy-MM-dd');

      const [feedingResponse, weightResponse, maintenanceResponse, feedTypesResponse] = await Promise.all([
        feedingRecordApi.getByDateRange(startStr, endStr),
        weightRecordApi.getByDateRange(startStr, endStr),
        maintenanceApi.getAll(),
        feedTypes.length === 0 ? feedTypeApi.getAll() : Promise.resolve({ data: feedTypes })
      ]);

      // デバッグ情報を追加
      console.log('Calendar data loaded:', {
        dateRange: `${startStr} to ${endStr}`,
        feedingRecordsCount: feedingResponse.data.length,
        feedingRecords: feedingResponse.data.map(r => ({
          id: r.id,
          feedingTime: r.feedingTime,
          feedingTimeType: typeof r.feedingTime,
          feedingTimeString: r.feedingTime.toString()
        }))
      });

      setFeedingRecords(feedingResponse.data);
      setWeightRecords(weightResponse.data);
      setMaintenanceRecords(maintenanceResponse.data.filter(record => {
        const recordDate = new Date(record.performedAt);
        return recordDate >= start && recordDate <= end;
      }));
      if (feedTypes.length === 0) {
        setFeedTypes(feedTypesResponse.data);
      }
    } catch (error) {
      console.error('Failed to load calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDayData = (date: Date) => {
    const dayFeeding = feedingRecords
      .filter(record => {
        // JST（ローカル時間）で日付比較を行う
        const recordDate = new Date(record.feedingTime.toString());
        
        // JST日付で比較するため、ローカル年月日を取得
        const targetYear = date.getFullYear();
        const targetMonth = date.getMonth() + 1; // getMonth()は0ベース
        const targetDay = date.getDate();
        const targetDateStr = `${targetYear}-${targetMonth.toString().padStart(2, '0')}-${targetDay.toString().padStart(2, '0')}`;
        
        const recordYear = recordDate.getFullYear();
        const recordMonth = recordDate.getMonth() + 1;
        const recordDay = recordDate.getDate();
        const recordDateStr = `${recordYear}-${recordMonth.toString().padStart(2, '0')}-${recordDay.toString().padStart(2, '0')}`;
        
        const isSame = targetDateStr === recordDateStr;
        
        // デバッグ情報を追加（11月1日のみ）
        if (date.getDate() === 1 && date.getMonth() === 10) {
          console.log('Debug filtering 11/1 (JST):', {
            targetDate: date.toISOString(),
            targetDateStr: targetDateStr,
            recordDateString: record.feedingTime.toString(),
            recordDate: recordDate.toISOString(),
            recordDateStr: recordDateStr,
            recordJSTHour: recordDate.getHours(),
            recordJSTMinute: recordDate.getMinutes(),
            recordUTCHour: recordDate.getUTCHours(),
            recordUTCMinute: recordDate.getUTCMinutes(),
            isSame: isSame,
            record: record
          });
        }
        
        return isSame;
      })
      .sort((a, b) => new Date(a.feedingTime).getTime() - new Date(b.feedingTime).getTime());
    
    const dayWeight = weightRecords.filter(record => 
      isSameDay(new Date(record.measuredDate), date)
    );
    const dayMaintenance = maintenanceRecords
      .filter(record => isSameDay(new Date(record.performedAt), date))
      .sort((a, b) => new Date(a.performedAt).getTime() - new Date(b.performedAt).getTime());

    return { feeding: dayFeeding, weight: dayWeight, maintenance: dayMaintenance };
  };



  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // 日曜日から開始
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setShowDetailModal(true);
    setMessage(null);
  };

  const handleUpdateRecord = async (id: number, feedTypeId: number, feedingTime: string) => {
    try {
      setLoading(true);
      const response = await feedingRecordApi.update(id, feedTypeId, feedingTime);
      setFeedingRecords(feedingRecords.map(r => r.id === id ? response.data : r));
      setEditingRecord(null);
      setMessage({ type: 'success', text: '餌やり記録を更新しました' });
    } catch (error) {
      setMessage({ type: 'error', text: '餌やり記録の更新に失敗しました' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecord = async (id: number) => {
    const recordToDelete = feedingRecords.find(r => r.id === id);
    if (!recordToDelete) return;
    
    if (!confirm(`${format(new Date(recordToDelete.feedingTime), 'yyyy/MM/dd HH:mm')}の餌やり記録を削除しますか？`)) return;

    try {
      setLoading(true);
      await feedingRecordApi.delete(id);
      setFeedingRecords(feedingRecords.filter(r => r.id !== id));
      setMessage({ type: 'success', text: '餌やり記録を削除しました' });
    } catch (error) {
      setMessage({ type: 'error', text: '餌やり記録の削除に失敗しました' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleConsumption = async (id: number, consumed: boolean | null) => {
    const newConsumed = consumed === null ? true : consumed === true ? false : null;
    
    try {
      setLoading(true);
      const response = await feedingRecordApi.updateConsumption(id, newConsumed);
      setFeedingRecords(feedingRecords.map(r => r.id === id ? response.data : r));
      setMessage({ type: 'success', text: '摂食状況を更新しました' });
    } catch (error) {
      setMessage({ type: 'error', text: '摂食状況の更新に失敗しました' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMaintenanceRecord = async (id: number, type: 'water_filter' | 'litter_box', performedAt: string, notes?: string) => {
    try {
      setLoading(true);
      const response = await maintenanceApi.update(id, type, performedAt, notes);
      setMaintenanceRecords(maintenanceRecords.map(r => r.id === id ? response.data : r));
      setEditingMaintenanceRecord(null);
      setMessage({ type: 'success', text: 'メンテナンス記録を更新しました' });
    } catch (error) {
      setMessage({ type: 'error', text: 'メンテナンス記録の更新に失敗しました' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMaintenanceRecord = async (id: number) => {
    const recordToDelete = maintenanceRecords.find(r => r.id === id);
    if (!recordToDelete) return;
    
    const typeName = recordToDelete.type === 'water_filter' ? '給水器フィルター交換' : 'トイレ砂交換';
    if (!confirm(`${format(new Date(recordToDelete.performedAt), 'yyyy/MM/dd HH:mm')}の${typeName}記録を削除しますか？`)) return;

    try {
      setLoading(true);
      await maintenanceApi.delete(id);
      setMaintenanceRecords(maintenanceRecords.filter(r => r.id !== id));
      setMessage({ type: 'success', text: 'メンテナンス記録を削除しました' });
    } catch (error) {
      setMessage({ type: 'error', text: 'メンテナンス記録の削除に失敗しました' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={previousMonth} className={styles.navButton}>
          ←
        </button>
        <h2>{format(currentDate, 'yyyy年MM月')}</h2>
        <button onClick={nextMonth} className={styles.navButton}>
          →
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}>読み込み中...</div>
      ) : (
        <div className={styles.calendar}>
          <div className={styles.weekdays}>
            {['日', '月', '火', '水', '木', '金', '土'].map(day => (
              <div key={day} className={styles.weekday}>{day}</div>
            ))}
          </div>
          <div className={styles.days}>
            {days.map(day => {
              const dayData = getDayData(day);
              const isCurrentMonth = day.getMonth() === currentDate.getMonth();
              
              return (
                <div 
                  key={day.toISOString()} 
                  className={`${styles.day} ${
                    !isCurrentMonth ? styles.otherMonth : ''
                  }`}
                  onClick={() => handleDayClick(day)}
                >
                  <div className={styles.dayNumber}>{format(day, 'd')}</div>
                  
                  {isCurrentMonth && dayData.feeding.length > 0 && (
                    <div className={styles.feedingRecords}>
                      {dayData.feeding.map((record) => (
                        <div 
                          key={record.id}
                          className={`${styles.feedingIndicator} ${
                            record.consumed === true ? styles.consumed : 
                            record.consumed === false ? styles.notConsumed : styles.unknown
                          }`}
                          title={`${format(new Date(record.feedingTime), 'HH:mm')} - ${record.feedType?.productName}`}
                        >
                          <div className={styles.feedingTime}>
                            {format(new Date(record.feedingTime), 'HH:mm')}
                          </div>
                          <div className={styles.feedingProduct}>
                            {record.feedType?.productName}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {isCurrentMonth && dayData.weight.length > 0 && (
                    <div className={styles.weightIndicator}>
                      {dayData.weight[0].weight}kg
                    </div>
                  )}
                  
                  {isCurrentMonth && dayData.maintenance.length > 0 && (
                    <div className={styles.maintenanceIndicator}>
                      {dayData.maintenance.map((record) => (
                        <div 
                          key={record.id}
                          className={styles.maintenanceItem}
                          title={`${format(new Date(record.performedAt), 'HH:mm')} - ${record.type === 'water_filter' ? '給水器フィルター交換' : 'トイレ砂交換'}${record.notes && record.notes.trim() ? ` (${record.notes.trim()})` : ''}`}
                        >
                          {record.type === 'water_filter' ? 'フィルター' : 'トイレ砂'}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 詳細モーダル */}
      {showDetailModal && selectedDate && (
        <div className={styles.modal} onClick={() => setShowDetailModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{format(selectedDate, 'yyyy年MM月dd日')}の記録</h3>
              <button 
                className={styles.closeButton}
                onClick={() => setShowDetailModal(false)}
              >
                ×
              </button>
            </div>

            {message && (
              <div className={`${styles.message} ${styles[message.type]}`}>
                {message.text}
              </div>
            )}

            <div className={styles.modalBody}>
              {/* 餌やり記録 */}
              <div className={styles.section}>
                <h4>餌やり記録</h4>
                {getDayData(selectedDate).feeding.length === 0 ? (
                  <p className={styles.noData}>記録がありません</p>
                ) : (
                  <div className={styles.recordList}>
                    {getDayData(selectedDate).feeding.map((record) => (
                      <div key={record.id} className={styles.recordItem}>
                        {editingRecord?.id === record.id ? (
                          <div className={styles.editForm}>
                            <div className={styles.editFields}>
                              <div className={styles.fieldGroup}>
                                <label>餌の種類</label>
                                <Select
                                  value={editingRecord.feedTypeId.toString()}
                                  onChange={(value) => setEditingRecord({ 
                                    ...editingRecord, 
                                    feedTypeId: parseInt(value) 
                                  })}
                                  options={feedTypes.map(ft => ({
                                    value: ft.id.toString(),
                                    label: `${ft.manufacturer} - ${ft.productName}`
                                  }))}
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
                              <div className={styles.time}>
                                {format(new Date(record.feedingTime), 'HH:mm')}
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

              {/* 体重記録 */}
              {getDayData(selectedDate).weight.length > 0 && (
                <div className={styles.section}>
                  <h4>体重記録</h4>
                  {getDayData(selectedDate).weight.map((record) => (
                    <div key={record.id} className={styles.weightRecord}>
                      <span>{record.pet?.name}: {record.weight}kg</span>
                    </div>
                  ))}
                </div>
              )}

              {/* メンテナンス記録 */}
              {getDayData(selectedDate).maintenance.length > 0 && (
                <div className={styles.section}>
                  <h4>メンテナンス記録</h4>
                  <div className={styles.recordList}>
                    {getDayData(selectedDate).maintenance.map((record) => (
                      <div key={record.id} className={styles.recordItem}>
                        {editingMaintenanceRecord?.id === record.id ? (
                          <div className={styles.editForm}>
                            <div className={styles.editFields}>
                              <div className={styles.fieldGroup}>
                                <label>種類</label>
                                <Select
                                  value={editingMaintenanceRecord.type}
                                  onChange={(value) => setEditingMaintenanceRecord({ 
                                    ...editingMaintenanceRecord, 
                                    type: value as 'water_filter' | 'litter_box'
                                  })}
                                  options={[
                                    { value: 'water_filter', label: '給水器フィルター交換' },
                                    { value: 'litter_box', label: 'トイレ砂交換' }
                                  ]}
                                />
                              </div>
                              <div className={styles.fieldGroup}>
                                <label>実施日時</label>
                                <Input
                                  type="datetime-local"
                                  value={format(new Date(editingMaintenanceRecord.performedAt), "yyyy-MM-dd'T'HH:mm")}
                                  onChange={(value) => setEditingMaintenanceRecord({ 
                                    ...editingMaintenanceRecord, 
                                    performedAt: new Date(value)
                                  })}
                                />
                              </div>
                            </div>
                            <div className={styles.fieldGroup}>
                              <label>メモ</label>
                              <Input
                                type="text"
                                value={editingMaintenanceRecord.notes || ''}
                                onChange={(value) => setEditingMaintenanceRecord({ 
                                  ...editingMaintenanceRecord, 
                                  notes: value
                                })}
                                placeholder="メモ（任意）"
                              />
                            </div>
                            <div className={styles.editButtons}>
                              <Button
                                onClick={() => handleUpdateMaintenanceRecord(
                                  editingMaintenanceRecord.id, 
                                  editingMaintenanceRecord.type,
                                  editingMaintenanceRecord.performedAt.toISOString(),
                                  editingMaintenanceRecord.notes
                                )}
                                disabled={loading}
                              >
                                保存
                              </Button>
                              <Button
                                variant="secondary"
                                onClick={() => setEditingMaintenanceRecord(null)}
                              >
                                キャンセル
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className={styles.recordInfo}>
                              <div className={styles.time}>
                                {format(new Date(record.performedAt), 'HH:mm')}
                              </div>
                              <div className={styles.maintenanceType}>
                                {record.type === 'water_filter' ? '給水器フィルター交換' : 'トイレ砂交換'}
                              </div>
                              {record.notes && (
                                <div className={styles.maintenanceNotes}>
                                  {record.notes}
                                </div>
                              )}
                            </div>
                            <div className={styles.recordActions}>
                              <Button
                                variant="secondary"
                                onClick={() => setEditingMaintenanceRecord(record)}
                                className={styles.actionButton}
                              >
                                編集
                              </Button>
                              <Button
                                variant="danger"
                                onClick={() => handleDeleteMaintenanceRecord(record.id)}
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};