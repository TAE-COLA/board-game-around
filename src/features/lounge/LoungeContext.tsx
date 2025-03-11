import { LoungeContextType } from 'models';
import { createContext } from 'react';

export const LoungeContext = createContext<LoungeContextType | undefined>(undefined);
