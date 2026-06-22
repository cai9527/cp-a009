import { useState, useCallback, useRef, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { wechatService } from '@/services/wechat';
import { useAppStore } from '@/store/useAppStore';
import { WechatLoginData, WechatAuthResult, WechatUserInfo, UserInfo } from '@/types';

export type WechatAuthStep = 'idle' | 'authorizing' | 'exchanging' | 'fetching_user' | 'logging_in' | 'success' | 'error';

interface UseWechatAuthReturn {
  step: WechatAuthStep;
  error: string | null;
  isLoading: boolean;
  loginData: WechatLoginData | null;
  authResult: WechatAuthResult | null;
  wechatUserInfo: WechatUserInfo | null;
  isNewUser: boolean;
  wechatLogin: () => Promise<boolean>;
  reset: () => void;
  cancel: () => void;
}

export const useWechatAuth = (): UseWechatAuthReturn => {
  const { login } = useAppStore();
  const [step, setStep] = useState<WechatAuthStep>('idle');
  const [error, setError] = useState<string | null>(null);
  const [loginData, setLoginData] = useState<WechatLoginData | null>(null);
  const [authResult, setAuthResult] = useState<WechatAuthResult | null>(null);
  const [wechatUserInfo, setWechatUserInfo] = useState<WechatUserInfo | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);

  const cancelledRef = useRef(false);
  const navigatedRef = useRef(false);

  const isLoading = step !== 'idle' && step !== 'success' && step !== 'error';

  const reset = useCallback(() => {
    setStep('idle');
    setError(null);
    setLoginData(null);
    setAuthResult(null);
    setWechatUserInfo(null);
    setIsNewUser(false);
    cancelledRef.current = false;
    navigatedRef.current = false;
  }, []);

  const cancel = useCallback(() => {
    console.log('[WechatAuth] 用户取消微信登录');
    cancelledRef.current = true;
    reset();
  }, [reset]);

  const wechatLogin = useCallback(async (): Promise<boolean> => {
    console.log('[WechatAuth] 开始微信登录流程');
    reset();
    cancelledRef.current = false;
    navigatedRef.current = false;
    
    try {
      setStep('authorizing');
      const codeData = await wechatService.getLoginCode();
      if (cancelledRef.current) return false;
      setLoginData(codeData);
      console.log('[WechatAuth] Step 1 - 获取授权码成功');

      setStep('exchanging');
      const tokenResult = await wechatService.exchangeCodeForToken(codeData);
      if (cancelledRef.current) return false;
      setAuthResult(tokenResult);
      console.log('[WechatAuth] Step 2 - 交换Token成功', { openid: tokenResult.openid });

      setStep('fetching_user');
      const userInfo = await wechatService.getUserInfo(tokenResult);
      if (cancelledRef.current) return false;
      setWechatUserInfo(userInfo);
      console.log('[WechatAuth] Step 3 - 获取用户信息成功', { nickname: userInfo.nickname });

      setStep('logging_in');
      const loginResult = await wechatService.loginOrRegister(tokenResult, userInfo);
      if (cancelledRef.current) return false;
      setIsNewUser(loginResult.isNewUser);
      
      const systemUser: UserInfo = {
        ...loginResult.user,
        loginType: 'wechat',
        openid: userInfo.openid,
        unionid: userInfo.unionid
      };
      
      login(systemUser, loginResult.token);
      
      console.log('[WechatAuth] Step 4 - 系统登录成功', { 
        userId: systemUser.id, 
        isNewUser: loginResult.isNewUser 
      });
      
      setStep('success');
      
      Taro.showToast({
        title: loginResult.isNewUser ? '注册成功' : '登录成功',
        icon: 'success'
      });
      
      return true;
    } catch (err) {
      if (cancelledRef.current) return false;
      console.error('[WechatAuth] 微信登录失败', err);
      const errorMessage = err instanceof Error ? err.message : '登录失败，请重试';
      setError(errorMessage);
      setStep('error');
      
      Taro.showToast({
        title: errorMessage,
        icon: 'none'
      });
      
      return false;
    }
  }, [login, reset]);

  useEffect(() => {
    return () => {
      if (isLoading) {
        console.log('[WechatAuth] 组件卸载，取消并重置登录状态');
        cancelledRef.current = true;
        reset();
      }
    };
  }, [isLoading, reset]);

  return {
    step,
    error,
    isLoading,
    loginData,
    authResult,
    wechatUserInfo,
    isNewUser,
    wechatLogin,
    reset,
    cancel
  };
};
