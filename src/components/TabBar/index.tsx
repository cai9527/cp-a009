import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';

interface TabItem {
  key: string;
  pagePath: string;
  text: string;
  icon: string;
  activeIcon: string;
}

const tabList: TabItem[] = [
  {
    key: 'home',
    pagePath: '/pages/home/index',
    text: '首页',
    icon: '🏠',
    activeIcon: '🏡'
  },
  {
    key: 'sport',
    pagePath: '/pages/sport/index',
    text: '运动',
    icon: '🏃',
    activeIcon: '🏃‍♂️'
  },
  {
    key: 'stats',
    pagePath: '/pages/stats/index',
    text: '统计',
    icon: '📊',
    activeIcon: '📈'
  },
  {
    key: 'mine',
    pagePath: '/pages/mine/index',
    text: '我的',
    icon: '👤',
    activeIcon: '🧑'
  }
];

interface TabBarProps {
  current: string;
}

const TabBar: React.FC<TabBarProps> = ({ current }) => {
  const handleTabClick = (tab: TabItem) => {
    if (tab.key === current) {
      return;
    }
    
    console.log('[TabBar] 切换到', tab.key);
    
    Taro.switchTab({
      url: tab.pagePath,
      fail: (err) => {
        console.error('[TabBar] 切换失败', err);
        Taro.showToast({
          title: '页面切换失败',
          icon: 'none'
        });
      }
    });
  };

  return (
    <View className={styles.tabBar}>
      <View className={styles.tabBarBg} />
      <View className={styles.tabBarContent}>
        {tabList.map((tab) => {
          const isActive = tab.key === current;
          return (
            <View
              key={tab.key}
              className={classnames(
                styles.tabItem,
                isActive && styles.active
              )}
              onClick={() => handleTabClick(tab)}
            >
              <View className={styles.tabIconWrapper}>
                <Text className={classnames(
                  styles.tabIcon,
                  isActive && styles.activeIcon
                )}>
                  {isActive ? tab.activeIcon : tab.icon}
                </Text>
                {isActive && <View className={styles.activeDot} />}
              </View>
              <Text className={classnames(
                styles.tabText,
                isActive && styles.activeText
              )}>
                {tab.text}
              </Text>
            </View>
          );
        })}
      </View>
      <View className={styles.safeArea} />
    </View>
  );
};

export default TabBar;
