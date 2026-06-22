import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';

interface BackButtonProps {
  delta?: number;
  onCustomBack?: () => void;
}

const BackButton: React.FC<BackButtonProps> = ({ delta = 1, onCustomBack }) => {
  const handleBack = () => {
    if (onCustomBack) {
      onCustomBack();
      return;
    }

    const pages = Taro.getCurrentPages();
    if (pages.length > 1) {
      Taro.navigateBack({ delta });
    } else {
      Taro.switchTab({ url: '/pages/home/index' });
    }
  };

  return (
    <View className={styles.backButton} onClick={handleBack}>
      <Text className={styles.backIcon}>←</Text>
      <Text className={styles.backText}>返回</Text>
    </View>
  );
};

export default BackButton;
