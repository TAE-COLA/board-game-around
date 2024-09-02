export default interface Lounge {
  id: string;
  gameId: string;
  code: string;
  ownerId?: string;
  memberIds?: string[];
  createdAt: object;
  deletedAt?: object;
}