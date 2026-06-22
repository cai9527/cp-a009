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
    activeIcon: '🏃'
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
  console.log('[TabBar] 渲染, current=', current, ', tab数量=', tabList.length);

  const handleTabClick = (tab: TabItem) => {
    console.log('[TabBar] 点击 tab:', tab.key, ', 当前:', current);
    
    if (tab.key === current) {
      console.log('[TabBar] 已经是当前页面，忽略');
      return;
    }
    
    console.log('[TabBar] 切换到:', tab.key, ', URL:', tab.pagePath);
    
    Taro.switchTab({
      url: tab.pagePath,
      success: () => {
        console.log('[TabBar] 切换成功');
        setTimeout(() => {
          Taro.hideTabBar({ animation: false, fail: () => {} });
        }, 50);
      },
      fail: (err) => {
        console.error('[TabBar] 切换失败', err);
        Taro.showToast({
          title: '页面切换失败',
          icon: 'none'
        });
      }
    });
  };

  if (!tabList || tabList.length === 0) {
    console.error('[TabBar] tabList 为空，无法渲染');
    return null;
  }

  return (
    <View className={styles.tabBar}>
      <View className={styles.tabBarBg} />
      <View className={styles.tabBarBorder} />
      <View className={styles.tabBarContent}>
        {tabList.map((tab, index) => {
          const isActive = tab.key === current;
          console.log('[TabBar] 渲染项:', index, tab.key, ', active=', isActive);
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
