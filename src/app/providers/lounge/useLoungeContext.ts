import { useContext } from 'react';
import { CommonError } from 'shared';
import { LoungeContext } from './LoungeContext';

export const useLoungeContext = () => {
  const context = useContext(LoungeContext);
  if (context === undefined) {
    throw new Error(CommonError.NO_LOUNGE_CONTEXT);
  }
  return context;
};
