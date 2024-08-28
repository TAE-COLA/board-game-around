import { useAuth } from 'features';
import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { showToast } from 'widgets';

const ProtectedRoute: React.FC = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate('/login', { replace: true });
      showToast({ title: '로그인 필요', body: '로그인이 필요한 메뉴입니다. 로그인해주세요.', type: 'error' });
    }
  }, [loading, user, location.pathname]);

  return <Outlet />;
};

export default ProtectedRoute;