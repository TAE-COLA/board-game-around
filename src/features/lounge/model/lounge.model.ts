export interface Lounge {
  id: string;
  gameId: string;
  code: string;
  ownerId: string;
  playerIds: string[];
  status: 'WAITING' | 'PLAYING' | 'END';
  createdAt: Date;
  deletedAt?: Date;
}

export const LOUNGE = {
  reference: 'Lounge',
  gameId: 'gameId',
  code: 'code',
  ownerId: 'ownerId',
  playerIds: 'playerIds',
  status: 'status',
  createdAt: 'createdAt',
  deletedAt: 'deletedAt',
} as const;
