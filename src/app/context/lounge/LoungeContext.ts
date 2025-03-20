import { Game, User } from 'models';
import { createContext } from 'react';

export interface LoungeContextType {
  loading: boolean;
  id: string;
  game: Game;
  code: string;
  owner: User;
  players: User[];
  status: 'WAITING' | 'PLAYING' | 'END';
  createdAt: object;
}

export const LoungeContext = createContext<LoungeContextType | undefined>(undefined);
