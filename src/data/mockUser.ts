import { UserInfo } from '@/types';

export const mockUser: UserInfo = {
  id: 'user_001',
  phone: '13800138000',
  nickname: '运动达人',
  avatar: 'https://picsum.photos/id/64/200/200',
  height: 175,
  weight: 70,
  createTime: '2024-01-01T00:00:00.000Z'
};

export const mockUsers: UserInfo[] = [
  mockUser,
  {
    id: 'user_002',
    phone: '13900139000',
    nickname: '跑步爱好者',
    avatar: 'https://picsum.photos/id/91/200/200',
    height: 170,
    weight: 65,
    createTime: '2024-02-15T00:00:00.000Z'
  }
];
