import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { WeightRecord } from '../../types';
import { format } from 'date-fns';
import styles from './WeightChart.module.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

interface WeightChartProps {
  weightRecords: WeightRecord[];
  petName: string;
  loading?: boolean;
}

export const WeightChart: React.FC<WeightChartProps> = ({
  weightRecords,
  petName,
  loading = false,
}) => {
  // Sort records by date
  const sortedRecords = [...weightRecords].sort(
    (a, b) => new Date(a.measuredDate).getTime() - new Date(b.measuredDate).getTime()
  );

  const data = {
    labels: sortedRecords.map(record => 
      format(new Date(record.measuredDate), 'yyyy/MM/dd')
    ),
    datasets: [
      {
        label: `${petName}の体重`,
        data: sortedRecords.map(record => record.weight),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `${petName}の体重推移`,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `体重: ${context.parsed.y}kg`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: '体重 (kg)',
        },
        ticks: {
          callback: function(value: any) {
            return `${value}kg`;
          },
        },
      },
      x: {
        title: {
          display: true,
          text: '測定日',
        },
      },
    },
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>グラフを読み込み中...</div>
      </div>
    );
  }

  if (sortedRecords.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.noData}>
          選択した期間に体重記録がありません
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.chartWrapper}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
};