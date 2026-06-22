import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

interface DataCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: string;
  subText?: string;
  theme?: 'default' | 'primary' | 'success' | 'info' | 'warning';
  onClick?: () => void;
}

const DataCard: React.FC<DataCardProps> = ({
  label,
  value,
  unit,
  icon,
  subText,
  theme = 'default',
  onClick
}) => {
  return (
    <View 
      className={classnames(styles.card, theme !== 'default' && styles[theme])}
      onClick={onClick}
    >
      <View className={styles.header}>
        <Text className={styles.label}>{label}</Text>
        {icon && <Text className={styles.icon}>{icon}</Text>}
      </View>
      <View>
        <Text className={styles.value}>{value}</Text>
        {unit && <Text className={styles.unit}>{unit}</Text>}
      </View>
      {subText && <Text className={styles.subText}>{subText}</Text>}
    </View>
  );
};

export default DataCard;
