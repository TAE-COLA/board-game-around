import { PageProps, Paths } from 'app';
import React, { useEffect } from 'react';
import { Dimension } from 'shared';
import { LoginContainer, LoginFields, Page } from 'widgets';
import { SideEffects } from './Login.intent';
import { useLoginIntent } from './useLoginIntent.hook';

export const LoginPage: React.FC<PageProps> = ({ navigate, toast }) => {
  const { state, loading, onEvent, sideEffect } = useLoginIntent();

  useEffect(() => {
    switch (sideEffect?.type) {
      case SideEffects.NAVIGATE_TO_REGISTER:
        navigate(Paths.register);
        break;
      case SideEffects.NAVIGATE_TO_MAIN:
        navigate(Paths.main);
        break;
      case SideEffects.SHOW_TOAST:
        toast(sideEffect.options);
        break;
    }
  }, [sideEffect]);

  return (
    <Page loading={loading} height={Dimension.ScreenHeight}>
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
