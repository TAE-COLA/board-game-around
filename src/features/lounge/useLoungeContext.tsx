import { LoungeContext } from 'features';
import { useContext } from 'react';

export const useLoungeContext = () => {
  const context = useContext(LoungeContext);
  if (context === undefined) {
    throw new Error('useLoungeContext must be used within an LoungeProvider');
  }
  return context;
};