import React, { useState, useEffect } from 'react';
import { Button } from './common/Button';
import { Input } from './common/Input';
import { scheduleApi } from '../services/api';
import { FeedingSchedule } from '../types';
import styles from './ScheduleManagement.module.css';

export const ScheduleManagement: React.FC = () => {
  const [schedules, setSchedules] = useState<FeedingSchedule[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newScheduleTime, setNewScheduleTime] = useState('');
  const [editingSchedule, setEditingSchedule] = useState<{ id: number; time: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      const response = await scheduleApi.getAll();
      setSchedules(response.data);
    } catch (error) {
      setMessage({ type: 'error', text: 'スケジュールの読み込みに失敗しました' });
    }
  };

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScheduleTime.trim()) return;

    try {
      setLoading(true);
      const response = await scheduleApi.create(newScheduleTime.trim());
      setSchedules([...schedules, response.data]);
      setNewScheduleTime('');
      setShowAddForm(false);
      setMessage({ type: 'success', text: '餌やりスケジュールを追加しました' });
    } catch (error) {
      setMessage({ type: 'error', text: 'スケジュールの追加に失敗しました' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSchedule = async (id: number, time: string) => {
    if (!time.trim()) return;

    try {
      setLoading(true);
      const response = await scheduleApi.update(id, time.trim());
      setSchedules(schedules.map(s => s.id === id ? response.data : s));
      setEditingSchedule(null);
      setMessage({ type: 'success', text: 'スケジュールを更新しました' });
    } catch (error) {
      setMessage({ type: 'error', text: 'スケジュールの更新に失敗しました' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSchedule = async (id: number) => {
    if (!confirm('このスケジュールを削除しますか？')) return;

    try {
      setLoading(true);
      await scheduleApi.delete(id);
      setSchedules(schedules.filter(s => s.id !== id));
      setMessage({ type: 'success', text: 'スケジュールを削除しました' });
    } catch (error) {
      setMessage({ type: 'error', text: 'スケジュールの削除に失敗しました' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSchedule = async (id: number) => {
    try {
      setLoading(true);
      const response = await scheduleApi.toggleActive(id);
      setSchedules(schedules.map(s => s.id === id ? response.data : s));
      setMessage({ type: 'success', text: 'スケジュールの状態を変更しました' });
    } catch (error) {
      setMessage({ type: 'error', text: 'スケジュールの状態変更に失敗しました' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2>餌やりスケジュール管理</h2>

      {message && (
        <div className={`${styles.message} ${styles[message.type]}`}>
          {message.text}
        </div>
      )}

      {/* スケジュール一覧 */}
      <div className={styles.card}>
        <div className={styles.header}>
          <h3>スケジュール一覧</h3>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            disabled={loading}
          >
            新しいスケジュールを追加
          </Button>
        </div>

        {schedules.length === 0 ? (
          <p className={styles.noData}>スケジュールが登録されていません</p>
        ) : (
          <div className={styles.scheduleList}>
            {schedules.map((schedule) => (
              <div key={schedule.id} className={styles.scheduleItem}>
                {editingSchedule?.id === schedule.id ? (
                  <div className={styles.editForm}>
                    <div className={styles.timeInput}>
                      <label>時刻</label>
                      <Input
                        type="time"
                        value={editingSchedule.time}
                        onChange={(value) => setEditingSchedule({ ...editingSchedule, time: value })}
                      />
                    </div>
                    <div className={styles.editButtons}>
                      <Button
                        onClick={() => handleUpdateSchedule(editingSchedule.id, editingSchedule.time)}
                        disabled={loading}
                      >
                        保存
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => setEditingSchedule(null)}
                      >
                        キャンセル
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className={styles.scheduleInfo}>
                      <span className={styles.timeDisplay}>{schedule.time}</span>
                      <span 
                        className={`${styles.status} ${schedule.isActive ? styles.active : styles.inactive}`}
                        onClick={() => handleToggleSchedule(schedule.id)}
                        title="クリックで有効/無効を切り替え"
                      >
                        {schedule.isActive ? '有効' : '無効'}
                      </span>
                    </div>
                    <div className={styles.scheduleActions}>
                      <Button
                        variant="secondary"
                        onClick={() => setEditingSchedule({ id: schedule.id, time: schedule.time })}
                        className={styles.actionButton}
                      >
                        編集
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleDeleteSchedule(schedule.id)}
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

      {/* 新規追加フォーム */}
      {showAddForm && (
        <div className={styles.card}>
          <h3>新しいスケジュールを追加</h3>
          <form onSubmit={handleAddSchedule} className={styles.addForm}>
            <div className={styles.formGroup}>
              <label>餌やり時刻 (HH:mm)</label>
              <Input
                type="time"
                value={newScheduleTime}
                onChange={setNewScheduleTime}
                required
              />
            </div>
            <div className={styles.formButtons}>
              <Button type="submit" disabled={loading || !newScheduleTime}>
                追加
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowAddForm(false);
                  setNewScheduleTime('');
                }}
              >
                キャンセル
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* 使用方法の説明 */}
      <div className={styles.card}>
        <h3>使用方法</h3>
        <ul className={styles.instructions}>
          <li><strong>追加</strong>: 「新しいスケジュールを追加」ボタンから時刻を設定</li>
          <li><strong>編集</strong>: 「編集」ボタンで時刻を変更</li>
          <li><strong>有効/無効</strong>: ステータス部分をクリックで切り替え</li>
          <li><strong>削除</strong>: 「削除」ボタンで完全に削除（確認ダイアログ表示）</li>
        </ul>
      </div>
    </div>
  );
};