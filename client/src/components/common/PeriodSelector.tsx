import React from 'react';
import { Select } from './Select';
import styles from './PeriodSelector.module.css';

export type TimePeriod = '1month' | '3months' | '6months' | '1year' | 'all';

interface PeriodSelectorProps {
  selectedPeriod: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
  disabled?: boolean;
}

const periodOptions = [
  { value: '1month', label: '直近1ヶ月' },
  { value: '3months', label: '直近3ヶ月' },
  { value: '6months', label: '直近6ヶ月' },
  { value: '1year', label: '直近1年' },
  { value: 'all', label: '全期間' },
];

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  selectedPeriod,
  onPeriodChange,
  disabled = false,
}) => {
  return (
    <div className={styles.container}>
      <label className={styles.label}>表示期間:</label>
      <Select
        value={selectedPeriod}
        onChange={(value) => onPeriodChange(value as TimePeriod)}
        options={periodOptions}
        disabled={disabled}
        className={styles.select}
      />
    </div>
  );
};