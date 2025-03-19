import { createContext } from 'react';

export interface AuthContextType {
  loading: boolean;
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
