import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Button, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import dayjs from 'dayjs';
import { useAppStore } from '@/store/useAppStore';
import { mockSportRecords } from '@/data/mockSportRecords';
import DataCard from '@/components/DataCard';
import SportCard from '@/components/SportCard';
import ProgressBar from '@/components/ProgressBar';
import TabBar from '@/components/TabBar';
import { 
  getTodayRecords, 
  formatDistance, 
  formatDuration, 
  formatCalories 
} from '@/utils/sport';
import styles from './index.module.scss';

const HomePage: React.FC = () => {
  const { user, isLogin, sportRecords, target, setSportRecords } = useAppStore();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    console.log('[Home] 页面加载');
    
    Taro.hideTabBar({ animation: false, fail: () => {} });
    
    const hour = dayjs().hour();
    if (hour < 6) setGreeting('凌晨好');
    else if (hour < 12) setGreeting('早上好');
    else if (hour < 14) setGreeting('中午好');
    else if (hour < 18) setGreeting('下午好');
    else setGreeting('晚上好');

    if (sportRecords.length === 0) {
      console.log('[Home] 加载Mock运动数据');
      setSportRecords(mockSportRecords);
    }
  }, []);

  const todayRecords = useMemo(() => getTodayRecords(sportRecords), [sportRecords]);
  
  const todayStats = useMemo(() => ({
    distance: todayRecords.reduce((sum, r) => sum + r.distance, 0),
    duration: todayRecords.reduce((sum, r) => sum + r.duration, 0),
    calories: todayRecords.reduce((sum, r) => sum + r.calories, 0),
    count: todayRecords.length
  }), [todayRecords]);

  const handleStartSport = () => {
    console.log('[Home] 点击开始运动');
    if (!isLogin) {
      Taro.showToast({ title: '请先登录', icon: 'none' });
      Taro.navigateTo({ url: '/pages/login/index' });
      return;
    }
    Taro.switchTab({ url: '/pages/sport/index' });
  };

  const handleViewDetail = (id: string) => {
    console.log('[Home] 查看运动详情', id);
    Taro.navigateTo({ url: `/pages/sport-detail/index?id=${id}` });
  };

  const handleGoLogin = () => {
    Taro.navigateTo({ url: '/pages/login/index' });
  };

  const handleGoMine = () => {
    if (isLogin) {
      Taro.switchTab({ url: '/pages/mine/index' });
    } else {
      Taro.navigateTo({ url: '/pages/login/index' });
    }
  };

  const handleViewAll = () => {
    Taro.switchTab({ url: '/pages/stats/index' });
  };

  const handleGoGoalSetting = () => {
    console.log('[Home] 跳转目标设定');
    if (!isLogin) {
      Taro.showToast({ title: '请先登录', icon: 'none' });
      Taro.navigateTo({ url: '/pages/login/index' });
      return;
    }
    Taro.navigateTo({ url: '/pages/goal-setting/index' });
  };

  const dateText = dayjs().format('M月D日 dddd');
  const weekDayText = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][dayjs().day()];

  return (
    <View className={styles.pageWrapper}>
      <ScrollView className={styles.page} scrollY>
        <View className={styles.header}>
          <View className={styles.greeting}>
            <View className={styles.greetingText}>
              <Text className={styles.hello}>
                {greeting}，{isLogin && user ? user.nickname : '运动爱好者'}
              </Text>
              <Text className={styles.date}>{dateText} {weekDayText}</Text>
            </View>
            <View className={styles.avatar} onClick={handleGoMine}>
              {isLogin && user?.avatar ? (
                <Image src={user.avatar} mode="aspectFill" />
              ) : (
                <Text>👤</Text>
              )}
            </View>
          </View>
        </View>

        <View className={styles.content}>
          {!isLogin && (
            <View className={styles.loginTip}>
              <Text className={styles.loginTipText}>登录后可同步您的运动数据</Text>
              <Button className={styles.loginBtn} onClick={handleGoLogin}>
                立即登录
              </Button>
            </View>
          )}

          <View className={styles.progressCard}>
            <View className={styles.progressHeader}>
              <Text className={styles.progressTitle}>今日目标</Text>
              <Text className={styles.goSetting} onClick={handleGoGoalSetting}>设定目标</Text>
            </View>
            <View className={styles.progressItem}>
              <ProgressBar
                label="运动距离"
                current={Number((todayStats.distance / 1000).toFixed(1))}
                target={target.dailyDistance}
                unit="km"
                theme="primary"
              />
            </View>
            <View className={styles.progressItem}>
              <ProgressBar
                label="运动时长"
                current={Math.round(todayStats.duration / 60)}
                target={target.dailyDuration}
                unit="min"
                theme="info"
              />
            </View>
            <View className={styles.progressItem}>
              <ProgressBar
                label="消耗热量"
                current={Math.round(todayStats.calories)}
                target={target.dailyCalories}
                unit="kcal"
                theme="success"
              />
            </View>
          </View>

          <View className={styles.dataGrid}>
            <DataCard
              label="今日距离"
              value={formatDistance(todayStats.distance)}
              icon="📏"
              theme="primary"
            />
            <DataCard
              label="今日时长"
              value={formatDuration(todayStats.duration)}
              icon="⏱️"
              theme="info"
            />
            <DataCard
              label="消耗热量"
              value={formatCalories(todayStats.calories)}
              icon="🔥"
              theme="success"
            />
            <DataCard
              label="运动次数"
              value={todayStats.count}
              unit="次"
              icon="🏆"
              theme="warning"
            />
          </View>

          <Button className={styles.startBtn} onClick={handleStartSport}>
            <Text>开始运动</Text>
            <Text>→</Text>
          </Button>

          <View className={styles.section}>
            <View className={styles.sectionHeader}>
              <Text className={styles.sectionTitle}>最近运动记录</Text>
              <Text className={styles.viewAll} onClick={handleViewAll}>查看全部</Text>
            </View>
            
            {sportRecords.length > 0 ? (
              sportRecords.slice(0, 3).map(record => (
                <SportCard
                  key={record.id}
                  record={record}
                  onClick={() => handleViewDetail(record.id)}
                />
              ))
            ) : (
              <View className={styles.empty}>
                <Text>暂无运动记录，开始您的第一次运动吧！</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
      <TabBar current="home" />
    </View>
  );
};

export default HomePage;
