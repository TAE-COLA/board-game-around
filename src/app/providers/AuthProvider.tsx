import { useToast } from '@chakra-ui/react';
import { Paths } from 'app/route';
import { fetchUserById } from 'features';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { AuthContext, User } from 'models';
import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { createDummy, requireLogin } from 'shared';

export const AuthProvider: React.FC = () => {
  const [user, setUser] = useState(createDummy<User>());
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const toast = useToast();
  const firebaseAuth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (currentUser) => {
      if (currentUser) {
        const data = await fetchUserById(currentUser.uid);
        if (data) setUser(data);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [firebaseAuth]);

  useEffect(() => {
    if (!loading && !firebaseAuth.currentUser) {
      navigate(Paths.login, { replace: true });
      toast(requireLogin);
    }
  }, [user, loading]);

  return (
    <AuthContext.Provider value={{ loading, ...user }}>
      <Outlet />
    </AuthContext.Provider>
  );
};
