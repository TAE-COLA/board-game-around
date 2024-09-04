export default interface Lounge {
  id: string;
  gameId: string;
  code: string;
  ownerId?: string;
  playerIds?: string[];
  createdAt: object;
  deletedAt?: object;
}