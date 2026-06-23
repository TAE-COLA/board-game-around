import { User } from 'features/auth';
import { Game } from 'features/game';
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
