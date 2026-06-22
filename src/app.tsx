import React, { useEffect } from 'react';
import { useDidShow, useDidHide } from '@tarojs/taro';
import { useAppStore } from '@/store/useAppStore';
// 全局样式
import './app.scss';

function App(props) {
  const { init } = useAppStore();
  
  useEffect(() => {
    console.log('[App] 应用启动，初始化存储');
    init();
  }, [init]);

  useDidShow(() => {
    console.log('[App] 应用显示');
  });

  useDidHide(() => {
    console.log('[App] 应用隐藏');
  });

  return props.children;
}

export default App;
