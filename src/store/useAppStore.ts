import { create } from 'zustand';
import { UserInfo, SportRecord, SportTarget } from '@/types';
import { storage } from '@/utils/storage';

interface AppState {
  user: UserInfo | null;
  token: string | null;
  sportRecords: SportRecord[];
  target: SportTarget;
  isLogin: boolean;
  
  init: () => void;
  setUser: (user: UserInfo | null) => void;
  setToken: (token: string | null) => void;
  login: (user: UserInfo, token: string) => void;
  logout: () => void;
  addSportRecord: (record: SportRecord) => void;
  setSportRecords: (records: SportRecord[]) => void;
  updateTarget: (target: Partial<SportTarget>) => void;
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
    set({ user: null, token: null, isLogin: false });
  },
  
  addSportRecord: (record) => {
    console.log('[Sport] 添加运动记录', record.id);
    set((state) => {
      const newRecords = [record, ...state.sportRecords];
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
  }
}));
