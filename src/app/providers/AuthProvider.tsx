import { useToast } from '@chakra-ui/react';
import { User } from 'entities';
import { AuthContext, fetchUserById } from 'features';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import React, { useEffect, useState } from 'react';

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const auth = getAuth();
  const toast = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const data = await fetchUserById(currentUser.uid);
        if (data) setUser(data);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  const login = async (email: string, password: string, callback: () => void) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const data = await fetchUserById(userCredential.user.uid);
      if (data) setUser(data);
      toast({ title: '로그인이 완료되었습니다.', status: 'success', duration: 2000 });
      callback();
    } catch (error) {
      toast({ title: '로그인에 실패했습니다.', status: 'error', duration: 2000 });
    }
  };

  const logout = async () => {
    setUser(null);
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      { children }
    </AuthContext.Provider>
  );
};

export default AuthProvider;