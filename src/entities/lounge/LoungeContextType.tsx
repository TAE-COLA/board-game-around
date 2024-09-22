import { Game, User } from 'entities';

export default interface LoungeContextType {
  id: string;
  loading: boolean;
  game: Game;
  code: string;
  owner: User;
  players: User[];
  status: 'WAITING' | 'PLAYING' | 'END';
  createdAt: object;
  exit: () => Promise<void>;
}