export type SportType = 'run' | 'ride' | 'walk';

export type LoginType = 'phone' | 'wechat';

export interface WechatUserInfo {
  openid: string;
  unionid?: string;
  nickname: string;
  headimgurl: string;
  sex: number;
  province: string;
  city: string;
  country: string;
  language: string;
}

export interface WechatAuthResult {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
  openid: string;
  scope: string;
  unionid?: string;
  userInfo?: WechatUserInfo;
}

export interface WechatLoginData {
  code: string;
  state: string;
}

export interface UserInfo {
  id: string;
  phone: string;
  nickname: string;
  avatar: string;
  height: number;
  weight: number;
  createTime: string;
  loginType?: LoginType;
  openid?: string;
  unionid?: string;
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

export interface ForgotPasswordForm {
  phone: string;
  code: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetTokenData {
  phone: string;
  code: string;
  expiresAt: number;
  used: boolean;
}

export type ResetPasswordStep = 'verify' | 'reset' | 'success';

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
