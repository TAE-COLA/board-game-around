export default interface Lounge {
  id: string;
  gameId: string;
  code: string;
  ownerId?: string;
  playerIds?: string[];
  status: 'WAITING' | 'PLAYING' | 'END';
  createdAt: object;
  deletedAt?: object;
}