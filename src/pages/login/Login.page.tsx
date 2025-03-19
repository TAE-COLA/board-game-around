import { PageProps } from 'app';
import React, { useEffect } from 'react';
import { LoginContainer, LoginFields, Page } from 'widgets';
import { useLoginIntent } from './useLoginIntent';

export const LoginPage: React.FC<PageProps> = ({ navigate, toast }) => {
  const { state, loading, onEvent, sideEffect } = useLoginIntent();

  useEffect(() => {
    switch (sideEffect?.type) {
      case 'NAVIGATE_TO_REGISTER':
        navigate('register');
        break;
      case 'NAVIGATE_TO_MAIN':
        navigate('main');
        break;
      case 'SHOW_TOAST':
        toast(sideEffect.options);
        break;
    }
  }, [sideEffect]);

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
