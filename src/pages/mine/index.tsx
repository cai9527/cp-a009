import React, { useMemo } from 'react';
import { View, Text, Button, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store/useAppStore';
import { mockSportRecords } from '@/data/mockSportRecords';
import TabBar from '@/components/TabBar';
import { 
  formatDistance, 
  formatDuration, 
  formatCalories 
} from '@/utils/sport';
import styles from './index.module.scss';

const MinePage: React.FC = () => {
  const { user, isLogin, sportRecords, logout, setSportRecords } = useAppStore();

  React.useEffect(() => {
    console.log('[Mine] 页面加载');
    if (sportRecords.length === 0) {
      setSportRecords(mockSportRecords);
    }
  }, []);

  const totalStats = useMemo(() => {
    return {
      distance: sportRecords.reduce((sum, r) => sum + r.distance, 0),
      duration: sportRecords.reduce((sum, r) => sum + r.duration, 0),
      calories: sportRecords.reduce((sum, r) => sum + r.calories, 0),
      count: sportRecords.length
    };
  }, [sportRecords]);

  const achievements = [
    {
      icon: '🏃',
      value: (totalStats.distance / 1000).toFixed(1),
      unit: 'km',
      label: '累计里程'
    },
    {
      icon: '⏱️',
      value: Math.round(totalStats.duration / 60).toString(),
      unit: 'min',
      label: '运动时长'
    },
    {
      icon: '🔥',
      value: Math.round(totalStats.calories).toString(),
      unit: 'kcal',
      label: '消耗热量'
    },
    {
      icon: '🏆',
      value: totalStats.count.toString(),
      unit: '次',
      label: '运动次数'
    }
  ];

  const handleGoLogin = () => {
    Taro.navigateTo({ url: '/pages/login/index' });
  };

  const handleGoRegister = () => {
    Taro.navigateTo({ url: '/pages/register/index' });
  };

  const handleGoGoalSetting = () => {
    if (!isLogin) {
      Taro.showToast({ title: '请先登录', icon: 'none' });
      Taro.navigateTo({ url: '/pages/login/index' });
      return;
    }
    Taro.navigateTo({ url: '/pages/goal-setting/index' });
  };

  const handleLogout = () => {
    Taro.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          console.log('[Mine] 用户登出');
          logout();
          Taro.showToast({ title: '已退出登录', icon: 'success' });
        }
      }
    });
  };

  const handleMenuItem = (type: string) => {
    if (!isLogin && type !== 'about') {
      Taro.showToast({ title: '请先登录', icon: 'none' });
      Taro.navigateTo({ url: '/pages/login/index' });
      return;
    }
    
    switch (type) {
      case 'goal':
        handleGoGoalSetting();
        break;
      case 'achievement':
        Taro.showToast({ title: '成就系统开发中', icon: 'none' });
        break;
      case 'data':
        Taro.showToast({ title: '数据导出开发中', icon: 'none' });
        break;
      case 'setting':
        Taro.showToast({ title: '设置开发中', icon: 'none' });
        break;
      case 'about':
        Taro.showModal({
          title: '关于',
          content: '运动记录 v1.0.0\n\n一款功能完善的运动记录应用，支持跑步、骑行、步行等多种运动类型的实时追踪与数据统计。',
          showCancel: false
        });
        break;
    }
  };

  const menuItems = [
    { type: 'goal', icon: '🎯', text: '目标设定' },
    { type: 'achievement', icon: '🏅', text: '运动成就' },
    { type: 'data', icon: '📊', text: '数据导出' },
    { type: 'setting', icon: '⚙️', text: '设置' },
    { type: 'about', icon: 'ℹ️', text: '关于' }
  ];

  const handleBindPhone = () => {
    if (user?.loginType === 'wechat' && !user.phone) {
      Taro.navigateTo({ url: '/pages/wechat-bind/index' });
    }
  };

  return (
    <View className={styles.pageWrapper}>
      <ScrollView className={styles.page} scrollY>
        <View className={styles.header}>
          {isLogin && user ? (
            <View className={styles.userInfo}>
              <View className={styles.avatar}>
                {user.avatar ? (
                  <Image 
                    src={user.avatar} 
                    mode="aspectFill"
                    onError={(e) => console.error('[Mine] 头像加载失败', e)}
                  />
                ) : (
                  <Text>👤</Text>
                )}
              </View>
              <View className={styles.userDetail}>
                <View className={styles.nicknameRow}>
                  <Text className={styles.nickname}>{user.nickname}</Text>
                  {user.loginType === 'wechat' && (
                    <View className={styles.loginTypeBadge}>
                      <Text>💬</Text>
                      <Text>微信</Text>
                    </View>
                  )}
                </View>
                <View className={styles.userMeta}>
                  <Text>📏 {user.height}cm</Text>
                  <Text>⚖️ {user.weight}kg</Text>
                </View>
                {user.loginType === 'wechat' && (
                  <View className={styles.phoneInfo} onClick={handleBindPhone}>
                    {user.phone ? (
                      <Text>📱 已绑定：{user.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}</Text>
                    ) : (
                      <Text>📱 点击绑定手机号</Text>
                    )}
                  </View>
                )}
              </View>
            </View>
          ) : (
            <View className={styles.loginCard}>
              <Text className={styles.loginTitle}>欢迎使用运动记录</Text>
              <Text className={styles.loginDesc}>登录后同步您的运动数据，享受完整功能</Text>
              <Button className={styles.loginBtn} onClick={handleGoLogin}>
                立即登录
              </Button>
            </View>
          )}
        </View>

        <View className={styles.content}>
          {isLogin && (
            <View className={styles.achievements}>
              <Text className={styles.sectionTitle}>我的成就</Text>
              <ScrollView className={styles.achievementScroll} scrollX>
                {achievements.map((item, index) => (
                  <View key={index} className={styles.achievementCard}>
                    <View className={styles.achievementIcon}>
                      <Text>{item.icon}</Text>
                    </View>
                    <Text className={styles.achievementValue}>
                      {item.value}
                      <Text className={styles.achievementUnit}>{item.unit}</Text>
                    </Text>
                    <Text className={styles.achievementLabel}>{item.label}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          <View className={styles.menu}>
            {menuItems.map((item) => (
              <View 
                key={item.type} 
                className={styles.menuItem}
                onClick={() => handleMenuItem(item.type)}
              >
                <View className={classnames(styles.menuIcon, styles[item.type])}>
                  <Text>{item.icon}</Text>
                </View>
                <Text className={styles.menuText}>{item.text}</Text>
                <Text className={styles.menuArrow}>›</Text>
              </View>
            ))}
          </View>

          {isLogin && (
            <View className={styles.logoutSection}>
              <Button className={styles.logoutBtn} onClick={handleLogout}>
                退出登录
              </Button>
            </View>
          )}
        </View>
      </ScrollView>
      <TabBar current="mine" />
    </View>
  );
};

export default MinePage;
