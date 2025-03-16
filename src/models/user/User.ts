export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export const USER = {
  collection: 'User',
  id: 'id',
  name: 'name',
  email: 'email',
  createdAt: 'createdAt',
} as const;
