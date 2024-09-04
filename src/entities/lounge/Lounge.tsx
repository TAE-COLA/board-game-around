export default interface Lounge {
  id: string;
  gameId: string;
  code: string;
  ownerId?: string;
  memberIds?: object;
  createdAt: object;
  deletedAt?: object;
}