import { LoungeContext } from 'models';
import { useContext } from 'react';
import { errorNoLoungeContext } from 'shared';

export const useLoungeContext = () => {
  const context = useContext(LoungeContext);
  if (context === undefined) {
    throw new Error(errorNoLoungeContext);
  }
  return context;
};
