import React, { useEffect } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAppStore } from '@/store/useAppStore';
import styles from './index.module.scss';

const Index: React.FC = () => {
  const { init, isLogin, checkWechatSession } = useAppStore();

  useEffect(() => {
    const bootstrap = async () => {
      console.log('[App] 应用启动初始化');
      
      init();
      
      if (isLogin) {
        try {
          await checkWechatSession();
        } catch (error) {
          console.error('[App] 检查微信会话失败', error);
        }
      }
      
      setTimeout(() => {
        console.log('[App] 跳转到首页');
        Taro.switchTab({ url: '/pages/home/index' });
      }, 1500);
    };

    bootstrap();
  }, [init, isLogin, checkWechatSession]);

  return (
    <View className={styles.container}>
      <View className={styles.card}>
        <Text className={styles.logo}>🏃</Text>
        <Text className={styles.welcome}>运动记录</Text>
        <Text className={styles.desc}>记录每一次运动，遇见更好的自己</Text>
        <View className={styles.loading}>
          <Text className={styles.loadingText}>加载中...</Text>
        </View>
      </View>
    </View>
  );
};

export default Index;
