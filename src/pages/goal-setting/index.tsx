import React, { useState } from 'react';
import { View, Text, Button, Slider, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store/useAppStore';
import styles from './index.module.scss';

const GoalSettingPage: React.FC = () => {
  const { isLogin, target, updateTarget } = useAppStore();
  
  const [dailyDistance, setDailyDistance] = useState(target.dailyDistance);
  const [dailyDuration, setDailyDuration] = useState(target.dailyDuration);
  const [dailyCalories, setDailyCalories] = useState(target.dailyCalories);
  const [weeklyDistance, setWeeklyDistance] = useState(target.weeklyDistance);

  const distancePresets = [3, 5, 8, 10, 15];
  const durationPresets = [20, 30, 45, 60, 90];
  const caloriesPresets = [200, 300, 400, 500, 600];
  const weeklyPresets = [15, 25, 40, 50, 75];

  const handleSave = () => {
    console.log('[GoalSetting] 保存目标设定', {
      dailyDistance,
      dailyDuration,
      dailyCalories,
      weeklyDistance
    });
    
    updateTarget({
      dailyDistance,
      dailyDuration,
      dailyCalories,
      weeklyDistance
    });
    
    Taro.showToast({ title: '保存成功', icon: 'success' });
    
    setTimeout(() => {
      Taro.navigateBack();
    }, 1000);
  };

  const handleGoLogin = () => {
    Taro.navigateTo({ url: '/pages/login/index' });
  };

  if (!isLogin) {
    return (
      <View className={styles.page}>
        <View className={styles.placeholder}>
          <Text className={styles.placeholderIcon}>🎯</Text>
          <Text className={styles.placeholderText}>登录后可设定您的运动目标</Text>
          <Button className={styles.loginBtn} onClick={handleGoLogin}>
            立即登录
          </Button>
        </View>
      </View>
    );
  }

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.content}>
        <View className={styles.tip}>
          <Text className={styles.tipTitle}>💡 小提示</Text>
          <Text className={styles.tipContent}>
            建议成年人每周进行至少150分钟中等强度有氧运动，或75分钟高强度有氧运动。设定合理的目标，循序渐进更易坚持！
          </Text>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>每日目标</Text>
          
          <View className={styles.goalItem}>
            <View className={styles.goalHeader}>
              <Text className={styles.goalLabel}>
                <Text className={styles.goalIcon}>📏</Text>
                运动距离
              </Text>
              <Text className={styles.goalValue}>{dailyDistance} km</Text>
            </View>
            <View className={styles.sliderContainer}>
              <Slider
                className={styles.slider}
                min={1}
                max={20}
                step={0.5}
                value={dailyDistance}
                activeColor="#FF6B35"
                backgroundColor="#E5E6EB"
                blockColor="#FF6B35"
                blockSize={24}
                onChange={(e) => setDailyDistance(e.detail.value)}
              />
              <View className={styles.sliderValues}>
                <Text>1 km</Text>
                <Text>20 km</Text>
              </View>
            </View>
            <View className={styles.quickPresets}>
              {distancePresets.map((val) => (
                <Text
                  key={val}
                  className={classnames(styles.presetBtn, dailyDistance === val && styles.active)}
                  onClick={() => setDailyDistance(val)}
                >
                  {val} km
                </Text>
              ))}
            </View>
          </View>

          <View className={styles.goalItem}>
            <View className={styles.goalHeader}>
              <Text className={styles.goalLabel}>
                <Text className={styles.goalIcon}>⏱️</Text>
                运动时长
              </Text>
              <Text className={styles.goalValue}>{dailyDuration} 分钟</Text>
            </View>
            <View className={styles.sliderContainer}>
              <Slider
                className={styles.slider}
                min={10}
                max={120}
                step={5}
                value={dailyDuration}
                activeColor="#00D4FF"
                backgroundColor="#E5E6EB"
                blockColor="#00D4FF"
                blockSize={24}
                onChange={(e) => setDailyDuration(e.detail.value)}
              />
              <View className={styles.sliderValues}>
                <Text>10 min</Text>
                <Text>120 min</Text>
              </View>
            </View>
            <View className={styles.quickPresets}>
              {durationPresets.map((val) => (
                <Text
                  key={val}
                  className={classnames(styles.presetBtn, dailyDuration === val && styles.active)}
                  onClick={() => setDailyDuration(val)}
                >
                  {val} min
                </Text>
              ))}
            </View>
          </View>

          <View className={styles.goalItem}>
            <View className={styles.goalHeader}>
              <Text className={styles.goalLabel}>
                <Text className={styles.goalIcon}>🔥</Text>
                消耗热量
              </Text>
              <Text className={styles.goalValue}>{dailyCalories} kcal</Text>
            </View>
            <View className={styles.sliderContainer}>
              <Slider
                className={styles.slider}
                min={100}
                max={1000}
                step={50}
                value={dailyCalories}
                activeColor="#00B42A"
                backgroundColor="#E5E6EB"
                blockColor="#00B42A"
                blockSize={24}
                onChange={(e) => setDailyCalories(e.detail.value)}
              />
              <View className={styles.sliderValues}>
                <Text>100 kcal</Text>
                <Text>1000 kcal</Text>
              </View>
            </View>
            <View className={styles.quickPresets}>
              {caloriesPresets.map((val) => (
                <Text
                  key={val}
                  className={classnames(styles.presetBtn, dailyCalories === val && styles.active)}
                  onClick={() => setDailyCalories(val)}
                >
                  {val} kcal
                </Text>
              ))}
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>每周目标</Text>
          
          <View className={styles.goalItem}>
            <View className={styles.goalHeader}>
              <Text className={styles.goalLabel}>
                <Text className={styles.goalIcon}>📅</Text>
                每周运动距离
              </Text>
              <Text className={styles.goalValue}>{weeklyDistance} km</Text>
            </View>
            <View className={styles.sliderContainer}>
              <Slider
                className={styles.slider}
                min={5}
                max={100}
                step={5}
                value={weeklyDistance}
                activeColor="#FF6B35"
                backgroundColor="#E5E6EB"
                blockColor="#FF6B35"
                blockSize={24}
                onChange={(e) => setWeeklyDistance(e.detail.value)}
              />
              <View className={styles.sliderValues}>
                <Text>5 km</Text>
                <Text>100 km</Text>
              </View>
            </View>
            <View className={styles.quickPresets}>
              {weeklyPresets.map((val) => (
                <Text
                  key={val}
                  className={classnames(styles.presetBtn, weeklyDistance === val && styles.active)}
                  onClick={() => setWeeklyDistance(val)}
                >
                  {val} km
                </Text>
              ))}
            </View>
          </View>
        </View>

        <Button className={styles.saveBtn} onClick={handleSave}>
          保存设定
        </Button>
      </View>
    </ScrollView>
  );
};

export default GoalSettingPage;
