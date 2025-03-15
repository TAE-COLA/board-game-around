import { useToast } from '@chakra-ui/react';
import { Paths } from 'app/route';
import { fetchUserById } from 'features';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { CommonToast } from 'shared';
import { AuthContext, AuthContextType } from './AuthContext';

export const AuthProvider: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const firebaseAuth = getAuth();

  const [authState, setAuthState] = useState<AuthContextType>();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (currentUser) => {
      if (currentUser) {
        const user = await fetchUserById(currentUser.uid);
        if (user) setAuthState({ loading: false, ...user });
      }
    });

    return () => unsubscribe();
  }, [firebaseAuth]);

  useEffect(() => {
    if (!authState?.loading && !firebaseAuth.currentUser) {
      navigate(Paths.login, { replace: true });
      toast(CommonToast.REQUIRE_LOGIN);
    }
  }, [authState]);

  return (
    <AuthContext.Provider value={authState}>
      <Outlet />
    </AuthContext.Provider>
  );
};
