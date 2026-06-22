import Taro from '@tarojs/taro';
import { ResetTokenData } from '@/types';

const STORAGE_KEYS = {
  USER: 'sport_user',
  TOKEN: 'sport_token',
  RECORDS: 'sport_records',
  TARGET: 'sport_target',
  RESET_TOKEN: 'sport_reset_token'
};

export const storage = {
  setUser: (user: any) => {
    try {
      Taro.setStorageSync(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (e) {
      console.error('[Storage] 保存用户信息失败', e);
    }
  },
  
  getUser: () => {
    try {
      const data = Taro.getStorageSync(STORAGE_KEYS.USER);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('[Storage] 获取用户信息失败', e);
      return null;
    }
  },
  
  setToken: (token: string) => {
    try {
      Taro.setStorageSync(STORAGE_KEYS.TOKEN, token);
    } catch (e) {
      console.error('[Storage] 保存Token失败', e);
    }
  },
  
  getToken: () => {
    try {
      return Taro.getStorageSync(STORAGE_KEYS.TOKEN) || null;
    } catch (e) {
      console.error('[Storage] 获取Token失败', e);
      return null;
    }
  },
  
  setRecords: (records: any[]) => {
    try {
      Taro.setStorageSync(STORAGE_KEYS.RECORDS, JSON.stringify(records));
    } catch (e) {
      console.error('[Storage] 保存运动记录失败', e);
    }
  },
  
  getRecords: () => {
    try {
      const data = Taro.getStorageSync(STORAGE_KEYS.RECORDS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('[Storage] 获取运动记录失败', e);
      return [];
    }
  },
  
  setTarget: (target: any) => {
    try {
      Taro.setStorageSync(STORAGE_KEYS.TARGET, JSON.stringify(target));
    } catch (e) {
      console.error('[Storage] 保存目标失败', e);
    }
  },
  
  getTarget: () => {
    try {
      const data = Taro.getStorageSync(STORAGE_KEYS.TARGET);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('[Storage] 获取目标失败', e);
      return null;
    }
  },

  setResetToken: (token: ResetTokenData) => {
    try {
      Taro.setStorageSync(STORAGE_KEYS.RESET_TOKEN, JSON.stringify(token));
    } catch (e) {
      console.error('[Storage] 保存重置令牌失败', e);
    }
  },

  getResetToken: (): ResetTokenData | null => {
    try {
      const data = Taro.getStorageSync(STORAGE_KEYS.RESET_TOKEN);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('[Storage] 获取重置令牌失败', e);
      return null;
    }
  },

  markResetTokenUsed: () => {
    try {
      const token = Taro.getStorageSync(STORAGE_KEYS.RESET_TOKEN);
      if (token) {
        const parsed = JSON.parse(token);
        parsed.used = true;
        Taro.setStorageSync(STORAGE_KEYS.RESET_TOKEN, JSON.stringify(parsed));
      }
    } catch (e) {
      console.error('[Storage] 标记重置令牌已使用失败', e);
    }
  },

  removeResetToken: () => {
    try {
      Taro.removeStorageSync(STORAGE_KEYS.RESET_TOKEN);
    } catch (e) {
      console.error('[Storage] 删除重置令牌失败', e);
    }
  },
  
  clear: () => {
    try {
      Taro.removeStorageSync(STORAGE_KEYS.USER);
      Taro.removeStorageSync(STORAGE_KEYS.TOKEN);
    } catch (e) {
      console.error('[Storage] 清除缓存失败', e);
    }
  }
};
