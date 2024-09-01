import { AuthContext } from 'features';
import { useContext } from 'react';

export const useAuth = () => {
  const context = useContext(AuthContext);
  console.log(context);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};