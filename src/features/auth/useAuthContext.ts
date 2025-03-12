import { AuthContext } from 'models';
import { useContext } from 'react';
import { CommonError } from 'shared';

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error(CommonError.NO_AUTH_CONTEXT);

  return context;
};
