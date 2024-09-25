import { useToast } from '@chakra-ui/react';
import { User } from 'entities';
import { AuthContext, fetchUserById } from 'features';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { createDummy } from 'shared';

const AuthProvider: React.FC = () => {
  const [user, setUser] = useState<User>(createDummy<User>());
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
      navigate('/login', { replace: true });
      toast({ title: '로그인이 필요한 메뉴입니다. 로그인해주세요.', status: 'error' , duration: 2000 });
    }
  }, [user, loading]);

  return (
    <AuthContext.Provider value={{ loading, user }}>
      <Outlet />
    </AuthContext.Provider>
  );
};

export default AuthProvider;