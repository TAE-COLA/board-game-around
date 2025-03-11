import { AuthContext } from 'models';
import { useContext } from 'react';
import { errorNoAuthContext } from 'shared';

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error(errorNoAuthContext);

  return context;
};
