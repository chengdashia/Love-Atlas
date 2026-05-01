import type { User, Couple } from '@/types'

export const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'xiaoming@love.com',
    nickname: '小明',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=xiaoming',
    coupleId: 'couple-1',
    createdAt: '2022-01-01T00:00:00Z',
  },
  {
    id: 'user-2',
    email: 'xiaomei@love.com',
    nickname: '小美',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=xiaomei',
    coupleId: 'couple-1',
    createdAt: '2022-01-01T00:00:00Z',
  },
]

export const mockCouple: Couple = {
  id: 'couple-1',
  name: '小明 & 小美',
  members: mockUsers,
  inviteCode: 'LOVE2022',
  createdAt: '2022-02-14T00:00:00Z',
}
