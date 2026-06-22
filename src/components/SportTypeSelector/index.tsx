import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import { SportType, SportTypeLabel, SportTypeIcon } from '@/types';
import styles from './index.module.scss';

interface SportTypeSelectorProps {
  value: SportType;
  onChange: (type: SportType) => void;
}

const sportTypes: { type: SportType; desc: string }[] = [
  { type: 'run', desc: '户外跑步' },
  { type: 'ride', desc: '户外骑行' },
  { type: 'walk', desc: '户外步行' }
];

const SportTypeSelector: React.FC<SportTypeSelectorProps> = ({ value, onChange }) => {
  return (
    <View className={styles.container}>
      {sportTypes.map(({ type, desc }) => (
        <View
          key={type}
          className={classnames(styles.item, value === type && styles.active)}
          onClick={() => onChange(type)}
        >
          <View className={classnames(styles.icon, styles[type])}>
            <Text>{SportTypeIcon[type]}</Text>
          </View>
          <Text className={styles.label}>{SportTypeLabel[type]}</Text>
          <Text className={styles.desc}>{desc}</Text>
        </View>
      ))}
    </View>
  );
};

export default SportTypeSelector;
