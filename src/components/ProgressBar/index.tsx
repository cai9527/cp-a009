import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

interface ProgressBarProps {
  label: string;
  current: number;
  target: number;
  unit?: string;
  theme?: 'primary' | 'success' | 'info' | 'warning';
  showSubInfo?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  label,
  current,
  target,
  unit = '',
  theme = 'primary',
  showSubInfo = true
}) => {
  const percent = Math.min(Math.round((current / target) * 100), 100);
  
  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.label}>{label}</Text>
        <Text className={styles.percent}>{percent}%</Text>
      </View>
      <View className={styles.track}>
        <View 
          className={classnames(styles.fill, styles[theme])}
          style={{ width: `${percent}%` }}
        />
      </View>
      {showSubInfo && (
        <View className={styles.subInfo}>
          <Text>已完成 {current}{unit}</Text>
          <Text>目标 {target}{unit}</Text>
        </View>
      )}
    </View>
  );
};

export default ProgressBar;
