import { useAuth } from 'app';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginContainer, LoginFields, Page } from 'widgets';

const LoginPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    navigate('/', { replace: true });
  }

  return (
    <Page height="100vh">
      <LoginContainer>
        <LoginFields />
      </LoginContainer>
    </Page>
  );
};

export default LoginPage;