export interface Lounge {
  id: string;
  gameId: string;
  code: string;
  ownerId: string;
  playerIds: string[];
  status: 'WAITING' | 'PLAYING' | 'END';
  createdAt: object;
  deletedAt?: object;
}

export const LOUNGE = {
  reference: 'Lounge',
  id: 'id',
  gameId: 'gameId',
  code: 'code',
  ownerId: 'ownerId',
  playerIds: 'playerIds',
  status: 'status',
  createdAt: 'createdAt',
  deletedAt: 'deletedAt',
} as const;
