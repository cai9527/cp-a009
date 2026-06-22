import React, { useState } from 'react';
import { View, Text, Canvas } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { DailyStats } from '@/types';
import { formatDistance, formatDuration, formatCalories } from '@/utils/sport';
import styles from './index.module.scss';

interface SimpleChartProps {
  title: string;
  data: DailyStats[];
}

type ChartType = 'distance' | 'duration' | 'calories';

const SimpleChart: React.FC<SimpleChartProps> = ({ title, data }) => {
  const [type, setType] = useState<ChartType>('distance');
  
  const getValue = (item: DailyStats) => {
    switch (type) {
      case 'distance': return item.distance / 1000;
      case 'duration': return item.duration / 60;
      case 'calories': return item.calories;
    }
  };
  
  const getUnit = () => {
    switch (type) {
      case 'distance': return 'km';
      case 'duration': return 'min';
      case 'calories': return 'kcal';
    }
  };
  
  const maxValue = Math.max(...data.map(getValue), 1);
  const barWidth = 100 / data.length;
  
  const formatDisplayValue = (val: number) => {
    switch (type) {
      case 'distance': return formatDistance(val * 1000);
      case 'duration': return formatDuration(val * 60);
      case 'calories': return formatCalories(val);
    }
  };
  
  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.title}>{title}</Text>
        <View className={styles.tabs}>
          <Text 
            className={classnames(styles.tab, type === 'distance' && styles.active)}
            onClick={() => setType('distance')}
          >
            距离
          </Text>
          <Text 
            className={classnames(styles.tab, type === 'duration' && styles.active)}
            onClick={() => setType('duration')}
          >
            时长
          </Text>
          <Text 
            className={classnames(styles.tab, type === 'calories' && styles.active)}
            onClick={() => setType('calories')}
          >
            热量
          </Text>
        </View>
      </View>
      
      <View className={styles.chart}>
        <View style={{ 
          display: 'flex', 
          alignItems: 'flex-end', 
          height: '100%', 
          justifyContent: 'space-around',
          paddingBottom: '40rpx'
        }}>
          {data.map((item, index) => {
            const value = getValue(item);
            const height = (value / maxValue) * 80;
            
            return (
              <View 
                key={index} 
                style={{ 
                  width: `${barWidth * 0.6}%`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  height: '100%'
                }}
              >
                <Text style={{ 
                  fontSize: '20rpx', 
                  color: '#86909C', 
                  marginBottom: '8rpx',
                  opacity: value > 0 ? 1 : 0
                }}>
                  {value > 0 ? formatDisplayValue(value) : ''}
                </Text>
                <View style={{
                  width: '100%',
                  height: `${height}%`,
                  minHeight: value > 0 ? '8rpx' : '0',
                  background: type === 'distance' 
                    ? 'linear-gradient(180deg, #FF6B35 0%, #FF8C5A 100%)'
                    : type === 'duration'
                    ? 'linear-gradient(180deg, #00D4FF 0%, #33DDFF 100%)'
                    : 'linear-gradient(180deg, #00B42A 0%, #00D432 100%)',
                  borderRadius: '8rpx 8rpx 0 0',
                  transition: 'all 0.3s ease'
                }} />
                <Text style={{ fontSize: '20rpx', color: '#86909C', marginTop: '8rpx' }}>
                  {item.date.slice(5)}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
      
      <View className={styles.legend}>
        <View className={styles.legendItem}>
          <View className={classnames(styles.dot, styles.distance)} />
          <Text>距离</Text>
        </View>
        <View className={styles.legendItem}>
          <View className={classnames(styles.dot, styles.duration)} />
          <Text>时长</Text>
        </View>
        <View className={styles.legendItem}>
          <View className={classnames(styles.dot, styles.calories)} />
          <Text>热量</Text>
        </View>
      </View>
    </View>
  );
};

export default SimpleChart;
