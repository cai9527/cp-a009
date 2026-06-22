import React from 'react';
import { View, Text } from '@tarojs/components';
import dayjs from 'dayjs';
import classnames from 'classnames';
import { SportRecord, SportTypeLabel, SportTypeIcon } from '@/types';
import { formatDistance, formatDuration, formatCalories } from '@/utils/sport';
import styles from './index.module.scss';

interface SportCardProps {
  record: SportRecord;
  onClick?: () => void;
}

const SportCard: React.FC<SportCardProps> = ({ record, onClick }) => {
  const sportType = record.type;
  
  return (
    <View className={styles.card} onClick={onClick}>
      <View className={styles.header}>
        <View className={styles.typeInfo}>
          <View className={classnames(styles.typeIcon, styles[sportType])}>
            <Text>{SportTypeIcon[sportType]}</Text>
          </View>
          <View>
            <Text className={styles.typeText}>{SportTypeLabel[sportType]}</Text>
          </View>
        </View>
        <Text className={styles.time}>
          {dayjs(record.startTime).format('MM-DD HH:mm')}
        </Text>
      </View>
      
      <View className={styles.stats}>
        <View className={styles.statItem}>
          <Text className={classnames(styles.statValue, styles[sportType])}>
            {formatDistance(record.distance)}
          </Text>
          <Text className={styles.statLabel}>距离</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={classnames(styles.statValue, styles[sportType])}>
            {formatDuration(record.duration)}
          </Text>
          <Text className={styles.statLabel}>时长</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={classnames(styles.statValue, styles[sportType])}>
            {formatCalories(record.calories)}
          </Text>
          <Text className={styles.statLabel}>卡路里</Text>
        </View>
      </View>
    </View>
  );
};

export default SportCard;
