import { useLoginIntent } from 'pages';
import React from 'react';
import { LoginContainer, LoginFields, Page } from 'widgets';

export const LoginPage: React.FC = () => {
  const { state, loading, onEvent } = useLoginIntent();

  return (
    <Page loading={loading} height='100vh'>
      <LoginContainer onClickRegisterButton={onEvent.onClickRegisterButton}>
        <LoginFields
          loading={loading}
          email={state.email}
          password={state.password}
          onEmailChange={onEvent.onEmailChange}
          onPasswordChange={onEvent.onPasswordChange}
          onClickLoginButton={onEvent.onClickLoginButton}
        />
      </LoginContainer>
    </Page>
  );
};
