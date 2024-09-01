import { useToast } from '@chakra-ui/react';
import { User } from 'entities';
import { fetchUserById } from 'features';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, callback: () => void) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
      toast({ title: '로그인 완료', description: '로그인이 완료되었습니다.', status: 'success', duration: 9000, isClosable: true });
      callback();
    } catch (error) {
      toast({ title: '로그인 실패', description: '로그인에 실패했습니다.', status: 'error', duration: 9000, isClosable: true });
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};