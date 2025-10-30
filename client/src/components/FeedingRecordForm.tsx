import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './common/Button';
import { Input } from './common/Input';
import { Select } from './common/Select';
import { feedTypeApi, scheduleApi, feedingRecordApi } from '../services/api';
import { FeedType, FeedingRecord } from '../types';
import { format } from 'date-fns';
import styles from './FeedingRecordForm.module.css';

export const FeedingRecordForm: React.FC = () => {
  const [feedTypes, setFeedTypes] = useState<FeedType[]>([]);
  const [selectedFeedType, setSelectedFeedType] = useState<string>('');
  const [feedingTime, setFeedingTime] = useState<string>('');
  const [unconsumedRecord, setUnconsumedRecord] = useState<FeedingRecord | null>(null);
  const [previousConsumption, setPreviousConsumption] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 新しい餌の種類追加用
  const [showAddFeed, setShowAddFeed] = useState(false);
  const [newManufacturer, setNewManufacturer] = useState('');
  const [newProductName, setNewProductName] = useState('');



  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // 餌の種類を取得
      const feedTypesResponse = await feedTypeApi.getAll();
      setFeedTypes(feedTypesResponse.data);



      // 記録されていない次のスケジュール時刻を取得
      const nextTimeResponse = await scheduleApi.getNextUnrecorded();
      if (nextTimeResponse.data.nextTime) {
        const now = new Date();
        const today = format(now, 'yyyy-MM-dd');
        setFeedingTime(`${today}T${nextTimeResponse.data.nextTime}`);
      } else {
        // デフォルトは現在時刻
        setFeedingTime(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
      }

      // 未記録の摂食状況があるかチェック
      const unconsumedResponse = await feedingRecordApi.getLatestUnconsumed();
      if (unconsumedResponse.data) {
        setUnconsumedRecord(unconsumedResponse.data);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'データの読み込みに失敗しました' });
    }
  };

  const handleAddFeedType = async (e?: React.FormEvent | React.MouseEvent) => {
    e?.preventDefault();
    if (!newManufacturer.trim() || !newProductName.trim()) return;

    try {
      setLoading(true);
      const response = await feedTypeApi.create(newManufacturer.trim(), newProductName.trim());
      setFeedTypes([...feedTypes, response.data]);
      setNewManufacturer('');
      setNewProductName('');
      setShowAddFeed(false);
      setMessage({ type: 'success', text: '餌の種類を追加しました' });
    } catch (error) {
      setMessage({ type: 'error', text: '餌の種類の追加に失敗しました' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePreviousConsumption = async () => {
    if (!unconsumedRecord || !previousConsumption) return;

    try {
      setLoading(true);
      await feedingRecordApi.updateConsumption(
        unconsumedRecord.id,
        previousConsumption === 'true'
      );
      setUnconsumedRecord(null);
      setPreviousConsumption('');
      setMessage({ type: 'success', text: '前回の摂食状況を記録しました' });
    } catch (error) {
      setMessage({ type: 'error', text: '摂食状況の更新に失敗しました' });
    } finally {
      setLoading(false);
    }
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFeedType || !feedingTime) return;

    try {
      setLoading(true);
      await feedingRecordApi.create(parseInt(selectedFeedType), feedingTime);
      setMessage({ type: 'success', text: '餌やり記録を追加しました' });
      
      // フォームをリセット
      setSelectedFeedType('');
      const now = new Date();
      setFeedingTime(format(now, "yyyy-MM-dd'T'HH:mm"));
    } catch (error) {
      setMessage({ type: 'error', text: '餌やり記録の追加に失敗しました' });
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
      <div className={styles.header}>
        <h2>餌やり記録</h2>
        <Link to="/schedule" className={styles.scheduleLink}>
          <Button variant="secondary">スケジュール管理</Button>
        </Link>
      </div>

      {message && (
        <div className={`${styles.message} ${styles[message.type]}`}>
          {message.text}
        </div>
      )}

      {/* 前回の摂食状況記録 */}
      {unconsumedRecord && (
        <div className={`${styles.card} ${styles.previousRecord}`}>
          <h3>前回の餌の摂食状況を記録してください</h3>
          <p>
            {format(new Date(unconsumedRecord.feedingTime), 'yyyy/MM/dd HH:mm')} - {' '}
            {unconsumedRecord.feedType?.manufacturer} {unconsumedRecord.feedType?.productName}
          </p>
          <div className={styles.formGroup}>
            <Select
              value={previousConsumption}
              onChange={setPreviousConsumption}
              options={[
                { value: 'true', label: '食べきった' },
                { value: 'false', label: '残した' }
              ]}
              placeholder="摂食状況を選択"
            />
          </div>
          <Button
            onClick={handleUpdatePreviousConsumption}
            disabled={!previousConsumption || loading}
          >
            記録する
          </Button>
        </div>
      )}



      {/* 餌やり記録フォーム */}
      <div className={styles.card}>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>餌の種類</label>
            <Select
              value={selectedFeedType}
              onChange={setSelectedFeedType}
              options={feedTypeOptions}
              placeholder="餌の種類を選択"
              required
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowAddFeed(!showAddFeed)}
              className={styles.addButton}
            >
              新しい餌を追加
            </Button>
          </div>

          {showAddFeed && (
            <div className={styles.addFeedForm}>
              <div className={styles.formGroup}>
                <label>メーカー名</label>
                <Input
                  value={newManufacturer}
                  onChange={setNewManufacturer}
                  placeholder="メーカー名を入力"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>商品名</label>
                <Input
                  value={newProductName}
                  onChange={setNewProductName}
                  placeholder="商品名を入力"
                  required
                />
              </div>
              <div className={styles.buttonGroup}>
                <Button onClick={handleAddFeedType} disabled={loading}>
                  追加
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowAddFeed(false)}
                >
                  キャンセル
                </Button>
              </div>
            </div>
          )}

          <div className={styles.formGroup}>
            <label>餌やり時刻</label>
            <Input
              type="datetime-local"
              value={feedingTime}
              onChange={setFeedingTime}
              required
            />
          </div>

          <Button type="submit" disabled={loading || !selectedFeedType || !feedingTime}>
            記録する
          </Button>
        </form>
      </div>
    </div>
  );
};