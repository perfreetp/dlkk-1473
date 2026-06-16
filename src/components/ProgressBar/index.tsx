import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, total, label }) => {
  const percent = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <View className={styles.container}>
      <View className={styles.info}>
        <Text className={styles.label}>
          {label || `填报进度：${current}/${total}`}
        </Text>
        <Text className={styles.percent}>{percent}%</Text>
      </View>
      <View className={styles.track}>
        <View
          className={styles.fill}
          style={{ width: `${percent}%` }}
        />
      </View>
    </View>
  );
};

export default ProgressBar;
