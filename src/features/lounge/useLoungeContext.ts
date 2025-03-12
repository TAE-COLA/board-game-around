import { LoungeContext } from 'models';
import { useContext } from 'react';
import { CommonError } from 'shared';

export const useLoungeContext = () => {
  const context = useContext(LoungeContext);
  if (context === undefined) {
    throw new Error(CommonError.NO_LOUNGE_CONTEXT);
  }
  return context;
};
