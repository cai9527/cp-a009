import React, { useState } from 'react';
import { View, Text, Button, Input, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store/useAppStore';
import styles from './index.module.scss';

const WechatBindPage: React.FC = () => {
  const { user, bindWechatPhone, sendResetCode } = useAppStore();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [codeCountdown, setCodeCountdown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const canBind = phone && code && /^1\d{10}$/.test(phone) && code.length === 6;

  const handleSendCode = async () => {
    console.log('[WechatBind] 发送验证码', phone);
    
    if (!phone) {
      Taro.showToast({ title: '请输入手机号', icon: 'none' });
      return;
    }
    
    if (!/^1\d{10}$/.test(phone)) {
      Taro.showToast({ title: '请输入正确的手机号', icon: 'none' });
      return;
    }

    try {
      const success = await sendResetCode(phone);
      
      if (success) {
        Taro.showToast({ title: '验证码已发送', icon: 'success' });
        setCodeCountdown(60);
        
        const timer = setInterval(() => {
          setCodeCountdown((prev) => {
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
    } catch (error) {
      console.error('[WechatBind] 发送验证码失败', error);
      Taro.showToast({ title: '发送失败，请重试', icon: 'none' });
    }
  };

  const handleBind = async () => {
    console.log('[WechatBind] 绑定手机号', { phone, code });
    
    if (!canBind) return;

    setIsLoading(true);
    
    try {
      const success = await bindWechatPhone(phone, code);
      
      if (success) {
        console.log('[WechatBind] 绑定成功');
        setShowSuccess(true);
      } else {
        Taro.showToast({ title: '绑定失败，请检查验证码', icon: 'none' });
      }
    } catch (error) {
      console.error('[WechatBind] 绑定失败', error);
      Taro.showToast({ title: '绑定失败，请重试', icon: 'none' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    console.log('[WechatBind] 跳过绑定');
    Taro.showModal({
      title: '提示',
      content: '跳过绑定后，部分功能可能无法正常使用，是否继续？',
      success: (res) => {
        if (res.confirm) {
          Taro.switchTab({ url: '/pages/home/index' });
        }
      }
    });
  };

  const handleSuccessConfirm = () => {
    setShowSuccess(false);
    Taro.switchTab({ url: '/pages/home/index' });
  };

  if (!user) {
    return (
      <View className={styles.page}>
        <View className={styles.header}>
          <Text className={styles.title}>请先登录</Text>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View className={styles.wechatIcon}>
          <Text>💬</Text>
        </View>
        <Text className={styles.title}>绑定手机号</Text>
        <Text className={styles.subtitle}>绑定手机号后可使用更多功能</Text>
      </View>

      <View className={styles.userInfoCard}>
        <Image
          className={styles.avatar}
          src={user.avatar || 'https://picsum.photos/id/64/200/200'}
          mode="aspectFill"
          onError={(e) => console.error('[WechatBind] 头像加载失败', e)}
        />
        <View className={styles.userInfo}>
          <Text className={styles.nickname}>{user.nickname}</Text>
          <View className={styles.loginType}>
            <Text>💬</Text>
            <Text>微信账号</Text>
          </View>
        </View>
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
              disabled={isLoading}
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
              disabled={isLoading}
            />
            <Button
              className={classnames(styles.codeBtn, codeCountdown > 0 && styles.disabled)}
              onClick={handleSendCode}
              disabled={codeCountdown > 0 || isLoading}
            >
              {codeCountdown > 0 ? `${codeCountdown}s` : '获取验证码'}
            </Button>
          </View>
        </View>
      </View>

      <Button
        className={classnames(styles.bindBtn, !canBind && styles.disabled, isLoading && styles.disabled)}
        onClick={handleBind}
        disabled={!canBind || isLoading}
      >
        {isLoading ? '绑定中...' : '立即绑定'}
      </Button>

      <Button
        className={styles.skipBtn}
        onClick={handleSkip}
        disabled={isLoading}
      >
        跳过绑定
      </Button>

      <View className={styles.tip}>
        <Text>绑定即表示同意</Text>
        <Text className={styles.highlight}>《用户协议》</Text>
        <Text>和</Text>
        <Text className={styles.highlight}>《隐私政策》</Text>
        <Text>，我们将保护您的手机号安全</Text>
      </View>

      {showSuccess && (
        <View className={styles.successModal}>
          <View className={styles.successContent}>
            <View className={styles.successIcon}>
              <Text>✓</Text>
            </View>
            <Text className={styles.successTitle}>绑定成功</Text>
            <Text className={styles.successDesc}>
              您的手机号 {phone} 已成功绑定到微信账号
            </Text>
            <Button
              className={styles.successBtn}
              onClick={handleSuccessConfirm}
            >
              开始使用
            </Button>
          </View>
        </View>
      )}
    </View>
  );
};

export default WechatBindPage;
