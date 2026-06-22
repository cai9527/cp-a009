import React, { useState } from 'react';
import { View, Text, Button, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store/useAppStore';
import { mockUser } from '@/data/mockUser';
import { generateId } from '@/utils/sport';
import styles from './index.module.scss';

const LoginPage: React.FC = () => {
  const { login } = useAppStore();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    console.log('[Login] 尝试登录', phone);
    
    if (!phone) {
      Taro.showToast({ title: '请输入手机号', icon: 'none' });
      return;
    }
    
    if (!/^1\d{10}$/.test(phone)) {
      Taro.showToast({ title: '请输入正确的手机号', icon: 'none' });
      return;
    }
    
    if (!password) {
      Taro.showToast({ title: '请输入密码', icon: 'none' });
      return;
    }
    
    if (password.length < 6) {
      Taro.showToast({ title: '密码至少6位', icon: 'none' });
      return;
    }

    const token = `token_${generateId()}`;
    const user = {
      ...mockUser,
      id: generateId(),
      phone,
      nickname: `用户${phone.slice(-4)}`
    };
    
    console.log('[Login] 登录成功', user);
    login(user, token);
    
    Taro.showToast({ title: '登录成功', icon: 'success' });
    
    setTimeout(() => {
      Taro.switchTab({ url: '/pages/home/index' });
    }, 1000);
  };

  const handleGoRegister = () => {
    Taro.navigateTo({ url: '/pages/register/index' });
  };

  const handleGoForgotPassword = () => {
    console.log('[Login] 跳转到忘记密码');
    Taro.navigateTo({ url: '/pages/forgot-password/index' });
  };

  const handleQuickLogin = (type: string) => {
    console.log('[Login] 快捷登录', type);
    Taro.showToast({ title: `${type}登录开发中`, icon: 'none' });
  };

  const handleTogglePassword = () => {
    console.log('[Login] 切换密码显示', !showPassword);
    setShowPassword(!showPassword);
  };

  const canLogin = phone && password && password.length >= 6;

  return (
    <View className={styles.page}>
      <View className={styles.logoSection}>
        <View className={styles.logo}>
          <Text>🏃</Text>
        </View>
        <Text className={styles.appName}>运动记录</Text>
        <Text className={styles.appDesc}>记录每一次运动，遇见更好的自己</Text>
      </View>

      <View className={styles.form}>
        <View className={styles.formItem}>
          <Text className={styles.label}>手机号</Text>
          <View className={classnames(styles.inputWrapper, focusedField === 'phone' && styles.focused)}>
            <Text className={styles.inputIcon}>📱</Text>
            <Input
              className={styles.input}
              type="number"
              placeholder="请输入手机号"
              placeholderClass={styles.input}
              value={phone}
              onInput={(e) => setPhone(e.detail.value)}
              onFocus={() => setFocusedField('phone')}
              onBlur={() => setFocusedField(null)}
              maxlength={11}
            />
          </View>
        </View>

        <View className={styles.formItem}>
          <Text className={styles.label}>密码</Text>
          <View className={classnames(styles.inputWrapper, focusedField === 'password' && styles.focused)}>
            <Text className={styles.inputIcon}>🔒</Text>
            <Input
              className={styles.input}
              password={!showPassword}
              placeholder="请输入密码"
              placeholderClass={styles.input}
              value={password}
              onInput={(e) => setPassword(e.detail.value)}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
            />
            <View className={styles.passwordToggle} onClick={handleTogglePassword}>
              <Text className={styles.icon}>
                {showPassword ? '🙈' : '👁️'}
              </Text>
            </View>
          </View>
        </View>

        <Button
          className={classnames(styles.loginBtn, !canLogin && styles.disabled)}
          onClick={handleLogin}
          disabled={!canLogin}
        >
          登录
        </Button>

        <View className={styles.footer}>
          <Text className={styles.link} onClick={handleGoRegister}>
            注册账号
          </Text>
          <Text className={styles.link} onClick={handleGoForgotPassword}>忘记密码？</Text>
        </View>
      </View>

      <View className={styles.divider}>
        <Text className={styles.text}>其他登录方式</Text>
      </View>

      <View className={styles.quickLogin}>
        <View className={styles.quickLoginBtn} onClick={() => handleQuickLogin('微信')}>
          <Text>💬</Text>
        </View>
        <View className={styles.quickLoginBtn} onClick={() => handleQuickLogin('QQ')}>
          <Text>🐧</Text>
        </View>
        <View className={styles.quickLoginBtn} onClick={() => handleQuickLogin('手机')}>
          <Text>📱</Text>
        </View>
      </View>

      <View className={styles.tip}>
        <Text>登录即表示同意</Text>
        <Text className={styles.highlight}>《用户协议》</Text>
        <Text>和</Text>
        <Text className={styles.highlight}>《隐私政策》</Text>
      </View>
    </View>
  );
};

export default LoginPage;
