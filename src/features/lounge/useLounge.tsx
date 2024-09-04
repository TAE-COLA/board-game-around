import { LoungeContext } from 'features';
import { useContext } from 'react';

export const useLounge = () => {
  const context = useContext(LoungeContext);
  if (context === undefined) {
    throw new Error('useLounge must be used within an LoungeProvider');
  }
  return context;
};