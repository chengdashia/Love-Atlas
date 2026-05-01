export interface User {
  id: string
  email: string
  phone?: string
  nickname: string
  avatar?: string
  coupleId?: string
  createdAt: string
}

export interface Couple {
  id: string
  name: string
  members: User[]
  inviteCode: string
  createdAt: string
}
