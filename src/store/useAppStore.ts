import { create } from 'zustand';
import { UserInfo, SportRecord, SportTarget, ResetTokenData, WechatAuthResult, WechatUserInfo } from '@/types';
import { storage } from '@/utils/storage';
import { validatePassword } from '@/utils/password';
import { wechatService } from '@/services/wechat';

interface AppState {
  user: UserInfo | null;
  token: string | null;
  sportRecords: SportRecord[];
  target: SportTarget;
  isLogin: boolean;
  wechatAuth: WechatAuthResult | null;
  
  init: () => void;
  setUser: (user: UserInfo | null) => void;
  setToken: (token: string | null) => void;
  login: (user: UserInfo, token: string) => void;
  logout: () => void;
  wechatLogin: () => Promise<{ success: boolean; isNewUser?: boolean }>;
  bindWechatPhone: (phone: string, code: string) => Promise<boolean>;
  checkWechatSession: () => Promise<boolean>;
  addSportRecord: (record: SportRecord) => void;
  deleteSportRecord: (id: string) => void;
  setSportRecords: (records: SportRecord[]) => void;
  updateTarget: (target: Partial<SportTarget>) => void;
  sendResetCode: (phone: string) => Promise<boolean>;
  verifyResetCode: (phone: string, code: string) => Promise<boolean>;
  resetPassword: (phone: string, code: string, newPassword: string) => Promise<boolean>;
  updateUserPassword: (phone: string, newPassword: string) => boolean;
}

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  token: null,
  sportRecords: [],
  target: {
    dailyDistance: 5,
    dailyDuration: 30,
    dailyCalories: 300,
    weeklyDistance: 25
  },
  isLogin: false,
  wechatAuth: null,

  init: () => {
    console.log('[Store] 初始化，从本地存储加载数据');
    
    const savedUser = storage.getUser();
    const savedToken = storage.getToken();
    const savedRecords = storage.getRecords();
    const savedTarget = storage.getTarget();
    
    set({
      user: savedUser,
      token: savedToken,
      isLogin: !!savedUser && !!savedToken,
      sportRecords: savedRecords || [],
      target: savedTarget || get().target
    });
    
    console.log('[Store] 初始化完成', {
      hasUser: !!savedUser,
      recordsCount: savedRecords?.length || 0,
      hasCustomTarget: !!savedTarget
    });
  },

  setUser: (user) => {
    if (user) storage.setUser(user);
    set({ user });
  },
  
  setToken: (token) => {
    if (token) storage.setToken(token);
    else storage.clear();
    set({ token });
  },
  
  login: (user, token) => {
    console.log('[Auth] 用户登录', user.phone);
    storage.setUser(user);
    storage.setToken(token);
    set({ user, token, isLogin: true });
  },
  
  logout: () => {
    console.log('[Auth] 用户登出');
    storage.clear();
    set({ user: null, token: null, isLogin: false, wechatAuth: null });
  },

  wechatLogin: async () => {
    console.log('[Auth] 开始微信登录');
    
    try {
      const loginData = await wechatService.getLoginCode();
      console.log('[Auth] Step 1 - 获取授权码成功');

      const authResult = await wechatService.exchangeCodeForToken(loginData);
      set({ wechatAuth: authResult });
      console.log('[Auth] Step 2 - 交换Token成功');

      const wechatUserInfo = await wechatService.getUserInfo(authResult);
      console.log('[Auth] Step 3 - 获取用户信息成功');

      const loginResult = await wechatService.loginOrRegister(authResult, wechatUserInfo);
      
      const systemUser: UserInfo = {
        ...loginResult.user,
        loginType: 'wechat',
        openid: wechatUserInfo.openid,
        unionid: wechatUserInfo.unionid
      };
      
      get().login(systemUser, loginResult.token);
      
      console.log('[Auth] Step 4 - 系统登录成功', { 
        userId: systemUser.id, 
        isNewUser: loginResult.isNewUser 
      });
      
      return { success: true, isNewUser: loginResult.isNewUser };
    } catch (error) {
      console.error('[Auth] 微信登录失败', error);
      return { success: false };
    }
  },

  bindWechatPhone: async (phone, code) => {
    console.log('[Auth] 绑定微信手机号', { phone });
    
    const currentUser = get().user;
    if (!currentUser || !currentUser.openid) {
      console.warn('[Auth] 未找到微信用户信息');
      return false;
    }
    
    try {
      const success = await wechatService.bindPhone(currentUser.openid, phone, code);
      
      if (success) {
        const updatedUser = { ...currentUser, phone };
        get().setUser(updatedUser);
        console.log('[Auth] 手机号绑定成功');
      }
      
      return success;
    } catch (error) {
      console.error('[Auth] 绑定手机号失败', error);
      return false;
    }
  },

  checkWechatSession: async () => {
    console.log('[Auth] 检查微信会话');
    const isValid = await wechatService.checkWechatSession();
    
    if (!isValid) {
      console.warn('[Auth] 微信会话已过期');
      const currentUser = get().user;
      if (currentUser?.loginType === 'wechat') {
        get().logout();
      }
    }
    
    return isValid;
  },
  
  addSportRecord: (record) => {
    console.log('[Sport] 添加运动记录', record.id);
    set((state) => {
      const newRecords = [record, ...state.sportRecords];
      storage.setRecords(newRecords);
      return { sportRecords: newRecords };
    });
  },
  
  deleteSportRecord: (id) => {
    console.log('[Sport] 删除运动记录', id);
    set((state) => {
      const newRecords = state.sportRecords.filter(r => r.id !== id);
      storage.setRecords(newRecords);
      return { sportRecords: newRecords };
    });
  },
  
  setSportRecords: (records) => {
    storage.setRecords(records);
    set({ sportRecords: records });
  },
  
  updateTarget: (newTarget) => {
    console.log('[Target] 更新运动目标', newTarget);
    set((state) => {
      const updatedTarget = { ...state.target, ...newTarget };
      storage.setTarget(updatedTarget);
      return { target: updatedTarget };
    });
  },

  sendResetCode: async (phone) => {
    console.log('[Auth] 发送重置密码验证码', phone);
    
    if (!phone || !/^1\d{10}$/.test(phone)) {
      console.warn('[Auth] 手机号格式不正确', phone);
      return false;
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;
    
    const resetToken: ResetTokenData = {
      phone,
      code,
      expiresAt,
      used: false
    };
    
    storage.setResetToken(resetToken);
    console.log('[Auth] 验证码生成成功', { phone, code, expiresAt: new Date(expiresAt) });
    
    return true;
  },

  verifyResetCode: async (phone, code) => {
    console.log('[Auth] 验证重置密码验证码', { phone, code });
    
    const resetToken = storage.getResetToken();
    
    if (!resetToken) {
      console.warn('[Auth] 未找到重置令牌');
      return false;
    }
    
    if (resetToken.used) {
      console.warn('[Auth] 重置令牌已使用');
      return false;
    }
    
    if (Date.now() > resetToken.expiresAt) {
      console.warn('[Auth] 重置令牌已过期');
      return false;
    }
    
    if (resetToken.phone !== phone || resetToken.code !== code) {
      console.warn('[Auth] 手机号或验证码不匹配');
      return false;
    }
    
    console.log('[Auth] 验证码验证成功');
    return true;
  },

  resetPassword: async (phone, code, newPassword) => {
    console.log('[Auth] 重置密码', { phone });
    
    const resetToken = storage.getResetToken();
    
    if (!resetToken) {
      console.warn('[Auth] 未找到重置令牌');
      return false;
    }
    
    if (resetToken.used) {
      console.warn('[Auth] 重置令牌已使用');
      return false;
    }
    
    if (Date.now() > resetToken.expiresAt) {
      console.warn('[Auth] 重置令牌已过期');
      return false;
    }
    
    if (resetToken.phone !== phone || resetToken.code !== code) {
      console.warn('[Auth] 手机号或验证码不匹配');
      return false;
    }
    
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      console.warn('[Auth] 密码验证失败', passwordValidation.errors);
      return false;
    }
    
    const success = get().updateUserPassword(phone, newPassword);
    
    if (success) {
      storage.markResetTokenUsed();
      console.log('[Auth] 密码重置成功');
    }
    
    return success;
  },

  updateUserPassword: (phone, newPassword) => {
    console.log('[Auth] 更新用户密码', { phone });
    
    const savedUser = storage.getUser();
    if (savedUser && savedUser.phone === phone) {
      const updatedUser = { ...savedUser, password: newPassword };
      storage.setUser(updatedUser);
      set({ user: updatedUser });
      console.log('[Auth] 当前登录用户密码已更新');
    }
    
    return true;
  }
}));
