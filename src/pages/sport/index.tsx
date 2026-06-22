import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import dayjs from 'dayjs';
import classnames from 'classnames';
import { useAppStore } from '@/store/useAppStore';
import SportTypeSelector from '@/components/SportTypeSelector';
import TabBar from '@/components/TabBar';
import { SportType, SportRecord, LocationPoint } from '@/types';
import { 
  formatDistance, 
  formatDuration, 
  formatPace,
  formatCalories,
  calculateDistance,
  calculateCalories,
  calculateAvgPace,
  calculateAvgSpeed,
  generateId
} from '@/utils/sport';
import styles from './index.module.scss';

type SportStatus = 'idle' | 'running' | 'paused';

const SportPage: React.FC = () => {
  const { isLogin, user, addSportRecord } = useAppStore();
  const [sportType, setSportType] = useState<SportType>('run');
  const [status, setStatus] = useState<SportStatus>('idle');
  const [duration, setDuration] = useState(0);
  const [distance, setDistance] = useState(0);
  const [calories, setCalories] = useState(0);
  const [currentPace, setCurrentPace] = useState(0);
  const [points, setPoints] = useState<LocationPoint[]>([]);
  const [startTime, setStartTime] = useState<string>('');
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const locationRef = useRef<number>(0);

  const startTimer = useCallback(() => {
    if (timerRef.current) return;
    
    console.log('[Sport] 开始运动计时');
    timerRef.current = setInterval(() => {
      setDuration(prev => prev + 1);
      
      if (status === 'running') {
        const speed = sportType === 'ride' ? 20 + Math.random() * 10 : 
                      sportType === 'run' ? 8 + Math.random() * 4 : 4 + Math.random() * 2;
        const deltaDistance = speed * 1000 / 3600;
        locationRef.current += deltaDistance;
        
        setDistance(prev => {
          const newDist = prev + deltaDistance;
          setCurrentPace(calculateAvgPace(newDist, duration + 1));
          return newDist;
        });
      }
    }, 1000);
  }, [status, sportType, duration]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      console.log('[Sport] 停止运动计时');
    }
  }, []);

  useEffect(() => {
    if (user) {
      const weight = user.weight || 70;
      setCalories(calculateCalories(sportType, duration, weight));
    } else {
      setCalories(calculateCalories(sportType, duration, 70));
    }
  }, [duration, sportType, user]);

  useEffect(() => {
    return () => {
      stopTimer();
    };
  }, [stopTimer]);

  useEffect(() => {
    Taro.hideTabBar({ animation: false, fail: () => {} });
  }, []);

  const handleStart = () => {
    if (!isLogin) {
      Taro.showToast({ title: '请先登录', icon: 'none' });
      Taro.navigateTo({ url: '/pages/login/index' });
      return;
    }
    
    console.log('[Sport] 开始运动', sportType);
    setStatus('running');
    setStartTime(dayjs().toISOString());
    setDuration(0);
    setDistance(0);
    setCalories(0);
    setCurrentPace(0);
    setPoints([]);
    locationRef.current = 0;
    startTimer();
    
    Taro.showToast({ title: '运动开始', icon: 'success' });
  };

  const handlePause = () => {
    console.log('[Sport] 暂停运动');
    setStatus('paused');
    stopTimer();
  };

  const handleResume = () => {
    console.log('[Sport] 继续运动');
    setStatus('running');
    startTimer();
  };

  const handleStop = () => {
    console.log('[Sport] 结束运动');
    Taro.showModal({
      title: '结束运动',
      content: '确定要结束本次运动吗？',
      success: (res) => {
        if (res.confirm) {
          finishSport();
        }
      }
    });
  };

  const finishSport = () => {
    stopTimer();
    
    if (duration < 10) {
      Taro.showToast({ title: '运动时间太短，未保存', icon: 'none' });
      resetSport();
      return;
    }
    
    const newPoints: LocationPoint[] = [];
    let lat = 39.9042;
    let lng = 116.4074;
    for (let i = 0; i < Math.floor(duration / 10); i++) {
      lat += (Math.random() - 0.5) * 0.001;
      lng += (Math.random() - 0.5) * 0.001;
      newPoints.push({
        latitude: lat,
        longitude: lng,
        timestamp: Date.now() + i * 10000,
        speed: 5 + Math.random() * 5
      });
    }
    
    const record: SportRecord = {
      id: generateId(),
      userId: user?.id || 'user_001',
      type: sportType,
      startTime,
      endTime: dayjs().toISOString(),
      duration,
      distance: Math.round(distance),
      calories: Math.round(calories),
      avgSpeed: calculateAvgSpeed(distance, duration),
      maxSpeed: 12 + Math.random() * 6,
      avgPace: calculateAvgPace(distance, duration),
      steps: sportType === 'walk' ? Math.floor(distance * 1.4) : Math.floor(distance * 1.2),
      points: newPoints
    };
    
    console.log('[Sport] 保存运动记录', record);
    addSportRecord(record);
    
    Taro.showToast({ title: '运动记录已保存', icon: 'success' });
    
    setTimeout(() => {
      Taro.navigateTo({ url: `/pages/sport-detail/index?id=${record.id}` });
    }, 1000);
    
    resetSport();
  };

  const resetSport = () => {
    setStatus('idle');
    setDuration(0);
    setDistance(0);
    setCalories(0);
    setCurrentPace(0);
    setPoints([]);
    setStartTime('');
    locationRef.current = 0;
  };

  const handleGoLogin = () => {
    Taro.navigateTo({ url: '/pages/login/index' });
  };

  if (!isLogin) {
    return (
      <View className={styles.pageWrapper}>
        <View className={styles.page}>
          <View className={styles.loginTip}>
            <Text className={styles.loginTipText}>登录后才能记录您的运动数据</Text>
            <Button className={styles.loginBtn} onClick={handleGoLogin}>
              立即登录
            </Button>
          </View>
        </View>
        <TabBar current="sport" />
      </View>
    );
  }

  return (
    <View className={styles.pageWrapper}>
      <View className={styles.page}>
        <View className={styles.content}>
          <View className={styles.typeSelector}>
            <SportTypeSelector value={sportType} onChange={setSportType} />
          </View>

          <View className={styles.dataPanel}>
            {status === 'idle' ? (
              <>
                <View className={styles.mainData}>
                  <Text className={styles.mainLabel}>准备运动</Text>
                  <View className={styles.mainValue}>
                    <Text>0.00</Text>
                    <Text className={styles.unit}>km</Text>
                  </View>
                </View>
                <Text className={styles.idleTip}>选择运动类型，点击下方按钮开始</Text>
              </>
            ) : (
              <>
                <View className={styles.timeDisplay}>
                  <Text className={styles.time}>{formatDuration(duration)}</Text>
                </View>
                
                <View className={styles.mainData}>
                  <Text className={styles.mainLabel}>运动距离</Text>
                  <View className={styles.mainValue}>
                    <Text>{(distance / 1000).toFixed(2)}</Text>
                    <Text className={styles.unit}>km</Text>
                  </View>
                </View>
                
                <View className={styles.subData}>
                  <View className={styles.subItem}>
                    <Text className={styles.subValue}>{formatPace(currentPace)}</Text>
                    <Text className={styles.subLabel}>配速</Text>
                  </View>
                  <View className={styles.subItem}>
                    <Text className={styles.subValue}>{formatCalories(calories)}</Text>
                    <Text className={styles.subLabel}>卡路里</Text>
                  </View>
                  <View className={styles.subItem}>
                    <Text className={styles.subValue}>{calculateAvgSpeed(distance, duration).toFixed(1)}</Text>
                    <Text className={styles.subLabel}>km/h</Text>
                  </View>
                </View>
              </>
            )}
          </View>

          <View className={styles.controls}>
            {status === 'idle' ? (
              <View className={styles.controlGroup}>
                <Button 
                  className={classnames(styles.controlBtn, styles.start)} 
                  onClick={handleStart}
                >
                  <Text>▶</Text>
                </Button>
                <Text className={styles.btnText}>开始运动</Text>
              </View>
            ) : (
              <>
                {status === 'running' ? (
                  <View className={styles.controlGroup}>
                    <Button 
                      className={classnames(styles.controlBtn, styles.pause)} 
                      onClick={handlePause}
                    >
                      <Text>⏸</Text>
                    </Button>
                    <Text className={styles.btnText}>暂停</Text>
                  </View>
                ) : (
                  <View className={styles.controlGroup}>
                    <Button 
                      className={classnames(styles.controlBtn, styles.resume)} 
                      onClick={handleResume}
                    >
                      <Text>▶</Text>
                    </Button>
                    <Text className={styles.btnText}>继续</Text>
                  </View>
                )}
                
                <View className={styles.controlGroup}>
                  <Button 
                    className={classnames(styles.controlBtn, styles.stop)} 
                    onClick={handleStop}
                  >
                    <Text>■</Text>
                  </Button>
                  <Text className={styles.btnText}>结束</Text>
                </View>
              </>
            )}
          </View>
        </View>
      </View>
      <TabBar current="sport" />
    </View>
  );
};

export default SportPage;
