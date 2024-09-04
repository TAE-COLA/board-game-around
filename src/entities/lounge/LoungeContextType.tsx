import { Game, User } from 'entities';

export default interface LoungeContextType {
  id: string;
  loading: boolean;
  game: Game;
  code: string;
  owner?: User;
  players?: User[];
  createdAt: object;
  deletedAt?: object;
  exit: (userId: string) => Promise<void>;
}