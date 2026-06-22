import Taro from '@tarojs/taro';
import { WechatAuthResult, WechatUserInfo, WechatLoginData } from '@/types';

const WECHAT_CONFIG = {
  appId: 'your_app_id',
  scope: 'snsapi_userinfo',
  statePrefix: 'wechat_login_',
  codeExpireTime: 5 * 60 * 1000,
};

const generateState = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `${WECHAT_CONFIG.statePrefix}${timestamp}_${random}`;
};

const validateState = (state: string): boolean => {
  if (!state || !state.startsWith(WECHAT_CONFIG.statePrefix)) {
    return false;
  }
  const parts = state.split('_');
  if (parts.length !== 4) return false;
  const timestamp = parseInt(parts[2], 10);
  return Date.now() - timestamp < WECHAT_CONFIG.codeExpireTime;
};

export const wechatService = {
  async getLoginCode(): Promise<WechatLoginData> {
    console.log('[Wechat] 获取微信登录凭证');
    
    const state = generateState();
    
    try {
      if (process.env.TARO_ENV === 'weapp') {
        const res = await Taro.login();
        console.log('[Wechat] 微信登录凭证获取成功', { hasCode: !!res.code });
        return {
          code: res.code,
          state
        };
      } else {
        console.log('[Wechat] H5环境模拟微信登录');
        return {
          code: `mock_code_${Date.now()}`,
          state
        };
      }
    } catch (error) {
      console.error('[Wechat] 获取微信登录凭证失败', error);
      throw new Error('微信登录失败，请重试');
    }
  },

  async exchangeCodeForToken(loginData: WechatLoginData): Promise<WechatAuthResult> {
    console.log('[Wechat] 交换授权码获取Access Token');
    
    if (!validateState(loginData.state)) {
      console.error('[Wechat] State参数校验失败，可能存在CSRF攻击');
      throw new Error('登录状态异常，请重新授权');
    }

    try {
      if (process.env.TARO_ENV === 'weapp') {
        const res = await Taro.request({
          url: '/api/wechat/token',
          method: 'POST',
          data: {
            code: loginData.code,
            state: loginData.state
          }
        });
        
        if (res.statusCode !== 200) {
          throw new Error('服务器响应错误');
        }
        
        const data = res.data as any;
        return {
          accessToken: data.access_token,
          expiresIn: data.expires_in,
          refreshToken: data.refresh_token,
          openid: data.openid,
          scope: data.scope,
          unionid: data.unionid
        };
      } else {
        console.log('[Wechat] H5环境模拟获取Access Token');
        return {
          accessToken: `mock_access_token_${Date.now()}`,
          expiresIn: 7200,
          refreshToken: `mock_refresh_token_${Date.now()}`,
          openid: `mock_openid_${Math.random().toString(36).substring(2, 10)}`,
          scope: WECHAT_CONFIG.scope,
          unionid: `mock_unionid_${Math.random().toString(36).substring(2, 10)}`
        };
      }
    } catch (error) {
      console.error('[Wechat] 交换授权码失败', error);
      throw error instanceof Error ? error : new Error('授权失败，请重试');
    }
  },

  async getUserInfo(authResult: WechatAuthResult): Promise<WechatUserInfo> {
    console.log('[Wechat] 获取微信用户信息');
    
    try {
      if (process.env.TARO_ENV === 'weapp') {
        const res = await Taro.request({
          url: '/api/wechat/userinfo',
          method: 'POST',
          data: {
            access_token: authResult.accessToken,
            openid: authResult.openid
          }
        });
        
        if (res.statusCode !== 200) {
          throw new Error('获取用户信息失败');
        }
        
        return res.data as WechatUserInfo;
      } else {
        console.log('[Wechat] H5环境模拟获取用户信息');
        return {
          openid: authResult.openid,
          unionid: authResult.unionid,
          nickname: '微信用户' + Math.floor(Math.random() * 10000),
          headimgurl: 'https://picsum.photos/id/64/200/200',
          sex: 1,
          province: '广东',
          city: '深圳',
          country: '中国',
          language: 'zh_CN'
        };
      }
    } catch (error) {
      console.error('[Wechat] 获取用户信息失败', error);
      throw error instanceof Error ? error : new Error('获取用户信息失败');
    }
  },

  async loginOrRegister(authResult: WechatAuthResult, userInfo: WechatUserInfo): Promise<{ user: any; token: string; isNewUser: boolean }> {
    console.log('[Wechat] 微信用户登录/注册', { openid: userInfo.openid });
    
    try {
      if (process.env.TARO_ENV === 'weapp') {
        const res = await Taro.request({
          url: '/api/wechat/login',
          method: 'POST',
          data: {
            openid: userInfo.openid,
            unionid: userInfo.unionid,
            nickname: userInfo.nickname,
            avatar: userInfo.headimgurl,
            access_token: authResult.accessToken
          }
        });
        
        if (res.statusCode !== 200) {
          throw new Error('登录失败');
        }
        
        return res.data as any;
      } else {
        console.log('[Wechat] H5环境模拟微信登录/注册');
        
        const mockUsers = JSON.parse(localStorage.getItem('mock_wechat_users') || '[]');
        let existingUser = mockUsers.find((u: any) => u.openid === userInfo.openid);
        const isNewUser = !existingUser;
        
        if (isNewUser) {
          existingUser = {
            id: `user_${Date.now()}`,
            phone: '',
            nickname: userInfo.nickname,
            avatar: userInfo.headimgurl,
            height: 0,
            weight: 0,
            createTime: new Date().toISOString(),
            loginType: 'wechat',
            openid: userInfo.openid,
            unionid: userInfo.unionid
          };
          mockUsers.push(existingUser);
          localStorage.setItem('mock_wechat_users', JSON.stringify(mockUsers));
        }
        
        return {
          user: existingUser,
          token: `wechat_token_${Date.now()}`,
          isNewUser
        };
      }
    } catch (error) {
      console.error('[Wechat] 微信登录/注册失败', error);
      throw error instanceof Error ? error : new Error('登录失败，请重试');
    }
  },

  async bindPhone(openid: string, phone: string, code: string): Promise<boolean> {
    console.log('[Wechat] 微信账号绑定手机号', { openid, phone });
    
    try {
      if (process.env.TARO_ENV === 'weapp') {
        const res = await Taro.request({
          url: '/api/wechat/bind',
          method: 'POST',
          data: { openid, phone, code }
        });
        
        if (res.statusCode !== 200) {
          throw new Error('绑定失败');
        }
        
        return true;
      } else {
        console.log('[Wechat] H5环境模拟绑定手机号');
        const mockUsers = JSON.parse(localStorage.getItem('mock_wechat_users') || '[]');
        const userIndex = mockUsers.findIndex((u: any) => u.openid === openid);
        
        if (userIndex !== -1) {
          mockUsers[userIndex].phone = phone;
          localStorage.setItem('mock_wechat_users', JSON.stringify(mockUsers));
        }
        
        return true;
      }
    } catch (error) {
      console.error('[Wechat] 绑定手机号失败', error);
      throw error instanceof Error ? error : new Error('绑定失败，请重试');
    }
  },

  async checkWechatSession(): Promise<boolean> {
    console.log('[Wechat] 检查微信登录态');
    
    try {
      if (process.env.TARO_ENV === 'weapp') {
        await Taro.checkSession();
        console.log('[Wechat] 微信登录态有效');
        return true;
      } else {
        const token = localStorage.getItem('wechat_token');
        return !!token;
      }
    } catch (error) {
      console.warn('[Wechat] 微信登录态已过期', error);
      return false;
    }
  },

  async refreshAccessToken(refreshToken: string): Promise<WechatAuthResult> {
    console.log('[Wechat] 刷新Access Token');
    
    try {
      if (process.env.TARO_ENV === 'weapp') {
        const res = await Taro.request({
          url: '/api/wechat/refresh',
          method: 'POST',
          data: { refresh_token: refreshToken }
        });
        
        if (res.statusCode !== 200) {
          throw new Error('刷新Token失败');
        }
        
        const data = res.data as any;
        return {
          accessToken: data.access_token,
          expiresIn: data.expires_in,
          refreshToken: data.refresh_token,
          openid: data.openid,
          scope: data.scope,
          unionid: data.unionid
        };
      } else {
        console.log('[Wechat] H5环境模拟刷新Token');
        return {
          accessToken: `mock_access_token_${Date.now()}`,
          expiresIn: 7200,
          refreshToken: `mock_refresh_token_${Date.now()}`,
          openid: 'mock_openid',
          scope: WECHAT_CONFIG.scope
        };
      }
    } catch (error) {
      console.error('[Wechat] 刷新Token失败', error);
      throw error instanceof Error ? error : new Error('登录已过期，请重新登录');
    }
  }
};
