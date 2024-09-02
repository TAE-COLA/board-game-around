import { useToast } from '@chakra-ui/react';
import { useAuth } from 'features';
import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

const ProtectedRoute: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate('/login', { replace: true });
      toast({ title: '로그인 필요', description: '로그인이 필요한 메뉴입니다. 로그인해주세요.', status: 'error' , duration: 2000, isClosable: true });
    }
  }, [user, loading]);

  return <Outlet />;
};

export default ProtectedRoute;