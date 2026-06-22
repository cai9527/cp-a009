import React, { useMemo } from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAppStore } from '@/store/useAppStore';
import { mockSportRecords } from '@/data/mockSportRecords';
import { SportTypeLabel, SportTypeIcon } from '@/types';
import { 
  formatDistance, 
  formatDuration, 
  formatCalories,
  formatPace,
  formatSpeed
} from '@/utils/sport';
import dayjs from 'dayjs';
import BackButton from '@/components/BackButton';
import styles from './index.module.scss';

const SportDetailPage: React.FC = () => {
  const { sportRecords, setSportRecords, deleteSportRecord } = useAppStore();

  const recordId = useMemo(() => {
    const pages = Taro.getCurrentPages();
    const currentPage = pages[pages.length - 1];
    return (currentPage as any).options?.id || '';
  }, []);

  const record = useMemo(() => {
    let records = sportRecords;
    if (records.length === 0) {
      records = mockSportRecords;
      setSportRecords(records);
    }
    return records.find(r => r.id === recordId) || records[0];
  }, [sportRecords, recordId, setSportRecords]);

  const handleDelete = () => {
    if (!record) return;
    
    Taro.showModal({
      title: '删除记录',
      content: '确定要删除这条运动记录吗？此操作不可恢复。',
      confirmColor: '#F53F3F',
      success: (res) => {
        if (res.confirm) {
          console.log('[SportDetail] 删除运动记录', record.id);
          deleteSportRecord(record.id);
          Taro.showToast({ title: '已删除', icon: 'success' });
          setTimeout(() => {
            Taro.navigateBack();
          }, 1000);
        }
      }
    });
  };

  if (!record) {
    return (
      <View className={styles.page}>
        <View className={styles.empty}>
          <Text>未找到运动记录</Text>
        </View>
      </View>
    );
  }

  const sportType = record.type;

  return (
    <ScrollView className={styles.page} scrollY>
      <BackButton />
      <View className={styles.header}>
        <View className={styles.typeInfo}>
          <View className={styles.typeIcon}>
            <Text>{SportTypeIcon[sportType]}</Text>
          </View>
          <View>
            <Text className={styles.typeText}>{SportTypeLabel[sportType]}</Text>
            <Text className={styles.time}>
              {dayjs(record.startTime).format('YYYY年M月D日 HH:mm')}
            </Text>
          </View>
        </View>

        <View className={styles.mainData}>
          <Text className={styles.mainLabel}>运动距离</Text>
          <View className={styles.mainValue}>
            <Text>{(record.distance / 1000).toFixed(2)}</Text>
            <Text className={styles.unit}>km</Text>
          </View>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.statsCard}>
          <View className={styles.statsGrid}>
            <View className={styles.statItem}>
              <Text className={styles.statValue}>{formatDuration(record.duration)}</Text>
              <Text className={styles.statLabel}>运动时长</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statValue}>{formatCalories(record.calories)}</Text>
              <Text className={styles.statLabel}>消耗热量</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statValue}>{record.steps.toLocaleString()}</Text>
              <Text className={styles.statLabel}>步数</Text>
            </View>
          </View>
        </View>

        <View className={styles.infoCard}>
          <Text className={styles.sectionTitle}>详细数据</Text>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>平均配速</Text>
            <Text className={styles.infoValue}>{formatPace(record.avgPace)}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>平均速度</Text>
            <Text className={styles.infoValue}>{formatSpeed(record.avgSpeed)}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>最高速度</Text>
            <Text className={styles.infoValue}>{formatSpeed(record.maxSpeed)}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>开始时间</Text>
            <Text className={styles.infoValue}>
              {dayjs(record.startTime).format('HH:mm:ss')}
            </Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>结束时间</Text>
            <Text className={styles.infoValue}>
              {dayjs(record.endTime).format('HH:mm:ss')}
            </Text>
          </View>
        </View>

        <View className={styles.mapPlaceholder}>
          <Text className={styles.mapIcon}>🗺️</Text>
          <Text className={styles.mapText}>运动轨迹地图</Text>
        </View>

        <Button className={styles.deleteBtn} onClick={handleDelete}>
          删除记录
        </Button>
      </View>
    </ScrollView>
  );
};

export default SportDetailPage;
