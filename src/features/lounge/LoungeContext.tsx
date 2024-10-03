import { LoungeContextType } from 'entities';
import { createContext } from 'react';

export const LoungeContext = createContext<LoungeContextType | undefined>(undefined);