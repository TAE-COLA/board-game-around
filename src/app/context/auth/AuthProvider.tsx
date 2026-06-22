import { useToast } from '@chakra-ui/react';
import { UserApi } from 'features';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { CommonToast, createDummy } from 'shared';
import { Paths } from '../../route';
import { AuthContext, AuthContextType } from './AuthContext';

export const AuthProvider: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const firebaseAuth = getAuth();

  const [authState, setAuthState] = useState({ ...createDummy<AuthContextType>(), loading: true });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (currentUser) => {
      if (!currentUser) {
        setAuthState({ ...createDummy<AuthContextType>(), loading: false });
        return;
      }

      try {
        const user = await UserApi.fetchById(currentUser.uid);
        setAuthState({ loading: false, ...user });
      } catch {
        setAuthState({ ...createDummy<AuthContextType>(), loading: false });
      }
    });

    return () => unsubscribe();
  }, [firebaseAuth]);

  useEffect(() => {
    if (!authState?.loading && !firebaseAuth.currentUser) {
      navigate(Paths.login, { replace: true });
      toast(CommonToast.REQUIRE_LOGIN);
    }
  }, [authState, firebaseAuth.currentUser, navigate, toast]);

  return (
    <AuthContext.Provider value={authState}>
      <Outlet />
    </AuthContext.Provider>
  );
};
