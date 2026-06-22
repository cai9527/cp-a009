import React, { useState, useMemo } from 'react';
import { View, Text, Button, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store/useAppStore';
import { mockUser } from '@/data/mockUser';
import { generateId } from '@/utils/sport';
import { validatePassword, validatePasswordMatch, PASSWORD_MIN_LENGTH } from '@/utils/password';
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

  const passwordValidation = useMemo(() => validatePassword(password), [password]);
  const confirmError = useMemo(() => validatePasswordMatch(password, confirmPassword), [password, confirmPassword]);

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
    
    if (code.length < 6) {
      Taro.showToast({ title: '请输入6位验证码', icon: 'none' });
      return;
    }
    
    if (!passwordValidation.isValid) {
      Taro.showToast({ title: passwordValidation.errors[0] || '请输入有效的密码', icon: 'none' });
      return;
    }
    
    if (confirmError) {
      Taro.showToast({ title: confirmError, icon: 'none' });
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

  const canRegister = phone && /^1\d{10}$/.test(phone) && code && code.length === 6 && passwordValidation.isValid && !confirmError;

  const renderStrengthBar = () => {
    const segments = [0, 1, 2];
    const activeCount = passwordValidation.strength === 'strong' ? 3 
      : passwordValidation.strength === 'medium' ? 2 
      : password ? 1 : 0;
    
    const strengthLabel = passwordValidation.strength === 'strong' ? '强'
      : passwordValidation.strength === 'medium' ? '中'
      : password ? '弱' : '';
    
    return (
      <View className={styles.passwordStrength}>
        <View className={styles.strengthLabel}>
          <Text className={styles.strengthText}>密码强度</Text>
          {password && (
            <Text className={classnames(styles.strengthValue, styles[passwordValidation.strength])}>
              {strengthLabel}
            </Text>
          )}
        </View>
        <View className={styles.strengthBar}>
          {segments.map((i) => (
            <View
              key={i}
              className={classnames(
                styles.strengthSegment,
                i < activeCount && styles.active,
                i < activeCount && styles[passwordValidation.strength]
              )}
            />
          ))}
        </View>
      </View>
    );
  };

  const renderPasswordChecks = () => {
    if (!password) return null;
    
    const checks = [
      { key: 'length', label: `至少${PASSWORD_MIN_LENGTH}位字符`, pass: passwordValidation.checks.length },
      { key: 'hasLowerCase', label: '包含小写字母', pass: passwordValidation.checks.hasLowerCase },
      { key: 'hasUpperCase', label: '包含大写字母', pass: passwordValidation.checks.hasUpperCase },
      { key: 'hasNumber', label: '包含数字', pass: passwordValidation.checks.hasNumber },
      { key: 'hasSpecialChar', label: '包含特殊符号', pass: passwordValidation.checks.hasSpecialChar },
      { key: 'varietyCount', label: '至少满足以上两种类型', pass: passwordValidation.checks.varietyCount }
    ];
    
    return (
      <View className={styles.passwordChecks}>
        {checks.map((check) => (
          <View key={check.key} className={styles.checkItem}>
            <View className={classnames(styles.checkIcon, check.pass ? styles.pass : styles.fail)}>
              {check.pass ? '✓' : '○'}
            </View>
            <Text className={classnames(styles.checkText, check.pass ? styles.pass : styles.fail)}>
              {check.label}
            </Text>
          </View>
        ))}
      </View>
    );
  };

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
          <View className={classnames(styles.codeInputWrapper, focusedField === 'code' && styles.focused)}>
            <Text className={styles.inputIcon}>🔐</Text>
            <Input
              className={styles.input}
              type="number"
              placeholder="请输入6位验证码"
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
              placeholder={`请输入密码（至少${PASSWORD_MIN_LENGTH}位）`}
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

        {renderStrengthBar()}
        {renderPasswordChecks()}

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

        {confirmError && (
          <View className={styles.passwordError}>
            <Text className={styles.errorText}>{confirmError}</Text>
          </View>
        )}

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
