import React, { useState, useMemo } from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store/useAppStore';
import { mockSportRecords } from '@/data/mockSportRecords';
import SimpleChart from '@/components/SimpleChart';
import SportCard from '@/components/SportCard';
import { SportType, SportTypeLabel, SportTypeIcon } from '@/types';
import { 
  getWeekRecords, 
  getMonthRecords, 
  getRecordsByType,
  getDailyStats,
  formatDistance, 
  formatDuration, 
  formatCalories 
} from '@/utils/sport';
import styles from './index.module.scss';

type TimeRange = 'week' | 'month' | 'year';
type FilterType = 'all' | SportType;

const StatsPage: React.FC = () => {
  const { isLogin, sportRecords, setSportRecords } = useAppStore();
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [filterType, setFilterType] = useState<FilterType>('all');

  React.useEffect(() => {
    console.log('[Stats] 页面加载');
    if (sportRecords.length === 0) {
      setSportRecords(mockSportRecords);
    }
  }, []);

  const filteredRecords = useMemo(() => {
    let records = [...sportRecords];
    
    if (timeRange === 'week') {
      records = getWeekRecords(records);
    } else if (timeRange === 'month') {
      records = getMonthRecords(records);
    }
    
    if (filterType !== 'all') {
      records = getRecordsByType(records, filterType);
    }
    
    return records;
  }, [sportRecords, timeRange, filterType]);

  const totalStats = useMemo(() => {
    const records = filteredRecords;
    return {
      distance: records.reduce((sum, r) => sum + r.distance, 0),
      duration: records.reduce((sum, r) => sum + r.duration, 0),
      calories: records.reduce((sum, r) => sum + r.calories, 0),
      count: records.length
    };
  }, [filteredRecords]);

  const typeStats = useMemo(() => {
    const types: SportType[] = ['run', 'ride', 'walk'];
    const totalDist = filteredRecords.reduce((sum, r) => sum + r.distance, 0);
    
    return types.map(type => {
      const typeRecords = getRecordsByType(filteredRecords, type);
      const distance = typeRecords.reduce((sum, r) => sum + r.distance, 0);
      return {
        type,
        distance,
        percent: totalDist > 0 ? Math.round((distance / totalDist) * 100) : 0,
        count: typeRecords.length
      };
    });
  }, [filteredRecords]);

  const chartData = useMemo(() => {
    const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365;
    return getDailyStats(sportRecords, Math.min(days, 7));
  }, [sportRecords, timeRange]);

  const handleViewDetail = (id: string) => {
    console.log('[Stats] 查看运动详情', id);
    Taro.navigateTo({ url: `/pages/sport-detail/index?id=${id}` });
  };

  const handleGoLogin = () => {
    Taro.navigateTo({ url: '/pages/login/index' });
  };

  const rangeTitle = {
    week: '本周',
    month: '本月',
    year: '本年'
  };

  if (!isLogin) {
    return (
      <View className={styles.page}>
        <View className={styles.loginTip}>
          <Text className={styles.loginTipText}>登录后查看您的运动统计</Text>
          <Button className={styles.loginBtn} onClick={handleGoLogin}>
            立即登录
          </Button>
        </View>
      </View>
    );
  }

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <Text className={styles.title}>运动统计</Text>
        <View className={styles.tabs}>
          <Text 
            className={classnames(styles.tab, timeRange === 'week' && styles.active)}
            onClick={() => setTimeRange('week')}
          >
            周
          </Text>
          <Text 
            className={classnames(styles.tab, timeRange === 'month' && styles.active)}
            onClick={() => setTimeRange('month')}
          >
            月
          </Text>
          <Text 
            className={classnames(styles.tab, timeRange === 'year' && styles.active)}
            onClick={() => setTimeRange('year')}
          >
            年
          </Text>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.overview}>
          <Text className={styles.overviewTitle}>{rangeTitle[timeRange]}概览</Text>
          <View className={styles.overviewGrid}>
            <View className={styles.overviewItem}>
              <Text className={styles.overviewValue}>
                {(totalStats.distance / 1000).toFixed(2)}
                <Text className={styles.overviewUnit}>km</Text>
              </Text>
              <Text className={styles.overviewLabel}>总距离</Text>
            </View>
            <View className={styles.overviewItem}>
              <Text className={styles.overviewValue}>
                {Math.round(totalStats.duration / 60)}
                <Text className={styles.overviewUnit}>min</Text>
              </Text>
              <Text className={styles.overviewLabel}>总时长</Text>
            </View>
            <View className={styles.overviewItem}>
              <Text className={styles.overviewValue}>
                {Math.round(totalStats.calories)}
                <Text className={styles.overviewUnit}>kcal</Text>
              </Text>
              <Text className={styles.overviewLabel}>总热量</Text>
            </View>
            <View className={styles.overviewItem}>
              <Text className={styles.overviewValue}>
                {totalStats.count}
                <Text className={styles.overviewUnit}>次</Text>
              </Text>
              <Text className={styles.overviewLabel}>运动次数</Text>
            </View>
          </View>
        </View>

        <View className={styles.chartSection}>
          <SimpleChart 
            title={`${rangeTitle[timeRange]}运动趋势`} 
            data={chartData} 
          />
        </View>

        <View className={styles.typeSection}>
          <Text className={styles.sectionTitle}>运动类型分布</Text>
          {typeStats.map(({ type, distance, percent }) => (
            <View key={type} className={styles.typeItem}>
              <View className={classnames(styles.typeIcon, styles[type])}>
                <Text>{SportTypeIcon[type]}</Text>
              </View>
              <View className={styles.typeInfo}>
                <Text className={styles.typeName}>{SportTypeLabel[type]}</Text>
                <View className={styles.typeBar}>
                  <View 
                    className={classnames(styles.typeFill, styles[type])}
                    style={{ width: `${percent}%` }}
                  />
                </View>
              </View>
              <View className={styles.typeStats}>
                <Text className={styles.typeDistance}>{formatDistance(distance)}</Text>
                <Text className={styles.typePercent}>{percent}%</Text>
              </View>
            </View>
          ))}
        </View>

        <View className={styles.recordsSection}>
          <Text className={styles.sectionTitle}>运动记录</Text>
          <View className={styles.filterTabs}>
            <Text 
              className={classnames(styles.filterTab, filterType === 'all' && styles.active)}
              onClick={() => setFilterType('all')}
            >
              全部
            </Text>
            <Text 
              className={classnames(styles.filterTab, filterType === 'run' && styles.active)}
              onClick={() => setFilterType('run')}
            >
              跑步
            </Text>
            <Text 
              className={classnames(styles.filterTab, filterType === 'ride' && styles.active)}
              onClick={() => setFilterType('ride')}
            >
              骑行
            </Text>
            <Text 
              className={classnames(styles.filterTab, filterType === 'walk' && styles.active)}
              onClick={() => setFilterType('walk')}
            >
              步行
            </Text>
          </View>
          
          {filteredRecords.length > 0 ? (
            filteredRecords.map(record => (
              <SportCard
                key={record.id}
                record={record}
                onClick={() => handleViewDetail(record.id)}
              />
            ))
          ) : (
            <View className={styles.empty}>
              <Text>暂无运动记录</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default StatsPage;
