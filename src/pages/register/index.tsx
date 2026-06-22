import React, { useState } from 'react';
import { View, Text, Button, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store/useAppStore';
import { mockUser } from '@/data/mockUser';
import { generateId } from '@/utils/sport';
import styles from './index.module.scss';

const RegisterPage: React.FC = () => {
  const { login } = useAppStore();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSendCode = () => {
    if (!phone) {
      Taro.showToast({ title: '请输入手机号', icon: 'none' });
      return;
    }
    
    if (!/^1\d{10}$/.test(phone)) {
      Taro.showToast({ title: '请输入正确的手机号', icon: 'none' });
      return;
    }
    
    console.log('[Register] 发送验证码', phone);
    setCountdown(60);
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    Taro.showToast({ title: '验证码已发送', icon: 'success' });
  };

  const handleRegister = () => {
    console.log('[Register] 尝试注册', phone);
    
    if (!phone) {
      Taro.showToast({ title: '请输入手机号', icon: 'none' });
      return;
    }
    
    if (!/^1\d{10}$/.test(phone)) {
      Taro.showToast({ title: '请输入正确的手机号', icon: 'none' });
      return;
    }
    
    if (!code) {
      Taro.showToast({ title: '请输入验证码', icon: 'none' });
      return;
    }
    
    if (code.length < 4) {
      Taro.showToast({ title: '请输入正确的验证码', icon: 'none' });
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
    
    if (password !== confirmPassword) {
      Taro.showToast({ title: '两次密码不一致', icon: 'none' });
      return;
    }

    const token = `token_${generateId()}`;
    const user = {
      ...mockUser,
      id: generateId(),
      phone,
      nickname: `用户${phone.slice(-4)}`
    };
    
    console.log('[Register] 注册成功', user);
    login(user, token);
    
    Taro.showToast({ title: '注册成功', icon: 'success' });
    
    setTimeout(() => {
      Taro.switchTab({ url: '/pages/home/index' });
    }, 1000);
  };

  const handleGoLogin = () => {
    Taro.navigateBack();
  };

  const handleTogglePassword = () => {
    console.log('[Register] 切换密码显示', !showPassword);
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPassword = () => {
    console.log('[Register] 切换确认密码显示', !showConfirmPassword);
    setShowConfirmPassword(!showConfirmPassword);
  };

  const canRegister = phone && code && password && confirmPassword && password === confirmPassword && password.length >= 6;

  return (
    <View className={styles.page}>
      <Text className={styles.title}>创建账号</Text>
      <Text className={styles.subtitle}>加入我们，开始您的运动之旅</Text>

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
          <Text className={styles.label}>验证码</Text>
          <View className={classnames(styles.inputWrapper, focusedField === 'code' && styles.focused)}>
            <Text className={styles.inputIcon}>🔐</Text>
            <Input
              className={styles.input}
              type="number"
              placeholder="请输入验证码"
              placeholderClass={styles.input}
              value={code}
              onInput={(e) => setCode(e.detail.value)}
              onFocus={() => setFocusedField('code')}
              onBlur={() => setFocusedField(null)}
              maxlength={6}
            />
            <Button
              className={classnames(styles.codeBtn, countdown > 0 && styles.disabled)}
              onClick={handleSendCode}
              disabled={countdown > 0}
            >
              {countdown > 0 ? `${countdown}s` : '获取验证码'}
            </Button>
          </View>
        </View>

        <View className={styles.formItem}>
          <Text className={styles.label}>设置密码</Text>
          <View className={classnames(styles.inputWrapper, focusedField === 'password' && styles.focused)}>
            <Text className={styles.inputIcon}>🔒</Text>
            <Input
              className={styles.input}
              password={!showPassword}
              placeholder="请输入密码（至少6位）"
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

        <View className={styles.formItem}>
          <Text className={styles.label}>确认密码</Text>
          <View className={classnames(styles.inputWrapper, focusedField === 'confirm' && styles.focused)}>
            <Text className={styles.inputIcon}>🔒</Text>
            <Input
              className={styles.input}
              password={!showConfirmPassword}
              placeholder="请再次输入密码"
              placeholderClass={styles.input}
              value={confirmPassword}
              onInput={(e) => setConfirmPassword(e.detail.value)}
              onFocus={() => setFocusedField('confirm')}
              onBlur={() => setFocusedField(null)}
            />
            <View className={styles.passwordToggle} onClick={handleToggleConfirmPassword}>
              <Text className={styles.icon}>
                {showConfirmPassword ? '🙈' : '👁️'}
              </Text>
            </View>
          </View>
        </View>

        <Button
          className={classnames(styles.registerBtn, !canRegister && styles.disabled)}
          onClick={handleRegister}
          disabled={!canRegister}
        >
          注册
        </Button>

        <View className={styles.footer}>
          <Text className={styles.link} onClick={handleGoLogin}>
            已有账号？去登录
          </Text>
        </View>
      </View>
    </View>
  );
};

export default RegisterPage;
