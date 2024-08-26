import React from 'react';
import { LoginContainer, LoginFields, Page } from 'widgets';

const LoginPage: React.FC = () => {
  return (
    <Page height="100vh">
      <LoginContainer>
        <LoginFields />
      </LoginContainer>
    </Page>
  );
};

export default LoginPage;