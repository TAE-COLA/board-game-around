import { AuthContextType } from 'entities';
import { createContext } from 'react';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);