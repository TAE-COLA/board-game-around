export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  deletedAt?: Date;
}

export const USER = {
  collection: 'Users',
  id: 'id',
  name: 'name',
  email: 'email',
  createdAt: 'createdAt',
} as const;
