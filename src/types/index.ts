export type SportType = 'run' | 'ride' | 'walk';

export interface UserInfo {
  id: string;
  phone: string;
  nickname: string;
  avatar: string;
  height: number;
  weight: number;
  createTime: string;
}

export interface SportTarget {
  dailyDistance: number;
  dailyDuration: number;
  dailyCalories: number;
  weeklyDistance: number;
}

export interface LocationPoint {
  latitude: number;
  longitude: number;
  timestamp: number;
  speed: number;
}

export interface SportRecord {
  id: string;
  userId: string;
  type: SportType;
  startTime: string;
  endTime: string;
  duration: number;
  distance: number;
  calories: number;
  avgSpeed: number;
  maxSpeed: number;
  avgPace: number;
  steps: number;
  points: LocationPoint[];
}

export interface DailyStats {
  date: string;
  distance: number;
  duration: number;
  calories: number;
  count: number;
}

export interface LoginForm {
  phone: string;
  password: string;
}

export interface RegisterForm {
  phone: string;
  code: string;
  password: string;
  confirmPassword: string;
}

export const SportTypeLabel: Record<SportType, string> = {
  run: '跑步',
  ride: '骑行',
  walk: '步行'
};

export const SportTypeIcon: Record<SportType, string> = {
  run: '🏃',
  ride: '🚴',
  walk: '🚶'
};
