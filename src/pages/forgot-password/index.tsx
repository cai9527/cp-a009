import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, Button, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store/useAppStore';
import { storage } from '@/utils/storage';
import { ResetPasswordStep } from '@/types';
import { validatePassword, validatePasswordMatch, PASSWORD_MIN_LENGTH } from '@/utils/password';
import BackButton from '@/components/BackButton';
import styles from './index.module.scss';

const ForgotPasswordPage: React.FC = () => {
  const { sendResetCode, verifyResetCode, resetPassword } = useAppStore();
  
  const [currentStep, setCurrentStep] = useState<ResetPasswordStep>('verify');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordValidation = useMemo(() => validatePassword(newPassword), [newPassword]);
  const confirmError = useMemo(() => validatePasswordMatch(newPassword, confirmPassword), [newPassword, confirmPassword]);

  const handleSendCode = useCallback(async () => {
    if (!phone) {
      Taro.showToast({ title: '请输入手机号', icon: 'none' });
      return;
    }
    
    if (!/^1\d{10}$/.test(phone)) {
      Taro.showToast({ title: '请输入正确的手机号', icon: 'none' });
      return;
    }
    
    setLoading(true);
    
    try {
      const success = await sendResetCode(phone);
      
      if (success) {
        Taro.showToast({ title: '验证码已发送', icon: 'success' });
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
      } else {
        Taro.showToast({ title: '发送失败，请重试', icon: 'none' });
      }
    } catch (e) {
      console.error('[ForgotPassword] 发送验证码出错', e);
      Taro.showToast({ title: '发送失败，请重试', icon: 'none' });
    } finally {
      setLoading(false);
    }
  }, [phone, sendResetCode]);

  const handleNextStep = useCallback(async () => {
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
    
    setLoading(true);
    
    try {
      const valid = await verifyResetCode(phone, code);
      
      if (valid) {
        setCurrentStep('reset');
      } else {
        const resetToken = storage.getResetToken();
        let errorMsg = '验证码错误或已过期';
        
        if (resetToken) {
          if (resetToken.used) {
            errorMsg = '验证码已被使用';
          } else if (Date.now() > resetToken.expiresAt) {
            errorMsg = '验证码已过期，请重新获取';
          }
        }
        
        Taro.showToast({ title: errorMsg, icon: 'none' });
      }
    } catch (e) {
      console.error('[ForgotPassword] 验证验证码出错', e);
      Taro.showToast({ title: '验证失败，请重试', icon: 'none' });
    } finally {
      setLoading(false);
    }
  }, [phone, code, verifyResetCode]);

  const handleResetPassword = useCallback(async () => {
    if (!passwordValidation.isValid) {
      Taro.showToast({ title: passwordValidation.errors[0] || '请输入有效的密码', icon: 'none' });
      return;
    }
    
    if (confirmError) {
      Taro.showToast({ title: confirmError, icon: 'none' });
      return;
    }
    
    setLoading(true);
    
    try {
      const success = await resetPassword(phone, code, newPassword);
      
      if (success) {
        setCurrentStep('success');
      } else {
        Taro.showToast({ title: '重置失败，请重试', icon: 'none' });
      }
    } catch (e) {
      console.error('[ForgotPassword] 重置密码出错', e);
      Taro.showToast({ title: '重置失败，请重试', icon: 'none' });
    } finally {
      setLoading(false);
    }
  }, [phone, code, newPassword, passwordValidation, confirmError, resetPassword]);

  const handleGoLogin = useCallback(() => {
    storage.removeResetToken();
    Taro.navigateBack();
  }, []);

  const handleGoBack = useCallback(() => {
    if (currentStep === 'reset') {
      setCurrentStep('verify');
    } else {
      Taro.navigateBack();
    }
  }, [currentStep]);

  const handleToggleNewPassword = useCallback(() => {
    setShowNewPassword(!showNewPassword);
  }, [showNewPassword]);

  const handleToggleConfirmPassword = useCallback(() => {
    setShowConfirmPassword(!showConfirmPassword);
  }, [showConfirmPassword]);

  const canVerify = phone && /^1\d{10}$/.test(phone) && code && code.length === 6 && !loading;
  const canReset = passwordValidation.isValid && !confirmError && !loading;

  const renderStrengthBar = () => {
    const segments = [0, 1, 2];
    const activeCount = passwordValidation.strength === 'strong' ? 3 
      : passwordValidation.strength === 'medium' ? 2 
      : newPassword ? 1 : 0;
    
    const strengthLabel = passwordValidation.strength === 'strong' ? '强'
      : passwordValidation.strength === 'medium' ? '中'
      : newPassword ? '弱' : '';
    
    return (
      <View className={styles.passwordStrength}>
        <View className={styles.strengthLabel}>
          <Text className={styles.strengthText}>密码强度</Text>
          {newPassword && (
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
    if (!newPassword) return null;
    
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

  const renderVerifyStep = () => (
    <>
      <View className={styles.header}>
        <Text className={styles.title}>找回密码</Text>
        <Text className={styles.subtitle}>请输入您的手机号，我们将发送验证码帮您重置密码</Text>
      </View>

      <View className={styles.form}>
        <View className={styles.stepIndicator}>
          <View className={classnames(styles.step, styles.active)}>
            <View className={styles.stepCircle}>1</View>
            <Text className={styles.stepText}>验证身份</Text>
          </View>
          <View className={styles.stepLine} />
          <View className={styles.step}>
            <View className={styles.stepCircle}>2</View>
            <Text className={styles.stepText}>设置密码</Text>
          </View>
          <View className={styles.stepLine} />
          <View className={styles.step}>
            <View className={styles.stepCircle}>3</View>
            <Text className={styles.stepText}>完成</Text>
          </View>
        </View>

        <View className={styles.formItem}>
          <Text className={styles.label}>手机号</Text>
          <View className={classnames(styles.inputWrapper, focusedField === 'phone' && styles.focused)}>
            <Text className={styles.inputIcon}>📱</Text>
            <Input
              className={styles.input}
              type="number"
              placeholder="请输入手机号"
              placeholderClass={styles.placeholder}
              value={phone}
              onInput={(e) => setPhone(e.detail.value)}
              onFocus={() => setFocusedField('phone')}
              onBlur={() => setFocusedField(null)}
              maxlength={11}
              disabled={loading}
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
              placeholderClass={styles.placeholder}
              value={code}
              onInput={(e) => setCode(e.detail.value)}
              onFocus={() => setFocusedField('code')}
              onBlur={() => setFocusedField(null)}
              maxlength={6}
              disabled={loading}
            />
            <Button
              className={classnames(styles.codeBtn, (countdown > 0 || loading) && styles.disabled)}
              onClick={handleSendCode}
              disabled={countdown > 0 || loading}
            >
              {loading ? '发送中...' : countdown > 0 ? `${countdown}s` : '获取验证码'}
            </Button>
          </View>
        </View>

        <Button
          className={classnames(styles.submitBtn, !canVerify && styles.disabled, loading && styles.loading)}
          onClick={handleNextStep}
          disabled={!canVerify}
        >
          {loading ? '验证中...' : '下一步'}
        </Button>

        <View className={styles.footer}>
          <Text className={styles.link} onClick={handleGoLogin}>
            想起密码？去登录
          </Text>
        </View>
      </View>
    </>
  );

  const renderResetStep = () => (
    <>
      <View className={styles.header}>
        <Text className={styles.title}>设置新密码</Text>
        <Text className={styles.subtitle}>请设置您的新密码，密码长度至少{PASSWORD_MIN_LENGTH}位</Text>
      </View>

      <View className={styles.form}>
        <View className={styles.stepIndicator}>
          <View className={classnames(styles.step, styles.completed)}>
            <View className={styles.stepCircle}>✓</View>
            <Text className={styles.stepText}>验证身份</Text>
          </View>
          <View className={styles.stepLine} />
          <View className={classnames(styles.step, styles.active)}>
            <View className={styles.stepCircle}>2</View>
            <Text className={styles.stepText}>设置密码</Text>
          </View>
          <View className={styles.stepLine} />
          <View className={styles.step}>
            <View className={styles.stepCircle}>3</View>
            <Text className={styles.stepText}>完成</Text>
          </View>
        </View>

        <View className={styles.phoneInfo}>
          <Text className={styles.phoneLabel}>重置账号：</Text>
          <Text className={styles.phoneNumber}>{phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}</Text>
        </View>

        <View className={styles.formItem}>
          <Text className={styles.label}>新密码</Text>
          <View className={classnames(styles.inputWrapper, focusedField === 'newPassword' && styles.focused)}>
            <Text className={styles.inputIcon}>🔒</Text>
            <Input
              className={styles.input}
              password={!showNewPassword}
              placeholder={`请输入新密码（至少${PASSWORD_MIN_LENGTH}位）`}
              placeholderClass={styles.placeholder}
              value={newPassword}
              onInput={(e) => setNewPassword(e.detail.value)}
              onFocus={() => setFocusedField('newPassword')}
              onBlur={() => setFocusedField(null)}
              disabled={loading}
            />
            <View className={styles.passwordToggle} onClick={handleToggleNewPassword}>
              <Text className={styles.icon}>
                {showNewPassword ? '🙈' : '👁️'}
              </Text>
            </View>
          </View>
        </View>

        {renderStrengthBar()}
        {renderPasswordChecks()}

        <View className={styles.formItem}>
          <Text className={styles.label}>确认新密码</Text>
          <View className={classnames(styles.inputWrapper, focusedField === 'confirmPassword' && styles.focused)}>
            <Text className={styles.inputIcon}>🔒</Text>
            <Input
              className={styles.input}
              password={!showConfirmPassword}
              placeholder="请再次输入新密码"
              placeholderClass={styles.placeholder}
              value={confirmPassword}
              onInput={(e) => setConfirmPassword(e.detail.value)}
              onFocus={() => setFocusedField('confirmPassword')}
              onBlur={() => setFocusedField(null)}
              disabled={loading}
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

        <View className={styles.btnGroup}>
          <Button className={styles.backBtn} onClick={handleGoBack} disabled={loading}>
            上一步
          </Button>
          <Button
            className={classnames(styles.submitBtn, !canReset && styles.disabled, loading && styles.loading)}
            onClick={handleResetPassword}
            disabled={!canReset}
          >
            {loading ? '重置中...' : '确认重置'}
          </Button>
        </View>
      </View>
    </>
  );

  const renderSuccessStep = () => (
    <View className={styles.successContent}>
      <View className={styles.successIcon}>
        <Text>✅</Text>
      </View>
      <Text className={styles.successTitle}>密码重置成功</Text>
      <Text className={styles.successDesc}>您的密码已成功重置，请使用新密码登录</Text>
      
      <Button className={styles.successBtn} onClick={handleGoLogin}>
        返回登录
      </Button>
    </View>
  );

  return (
    <View className={styles.page}>
      {currentStep !== 'success' && (
        <BackButton onCustomBack={handleGoBack} />
      )}

      {currentStep === 'verify' && renderVerifyStep()}
      {currentStep === 'reset' && renderResetStep()}
      {currentStep === 'success' && renderSuccessStep()}
    </View>
  );
};

export default ForgotPasswordPage;
