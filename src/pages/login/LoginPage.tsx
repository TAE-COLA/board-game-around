import { useLoginIntent } from 'pages';
import React from 'react';
import { LoginContainer, LoginFields, Page } from 'widgets';

const LoginPage: React.FC = () => {
  const { state, loading, onEvent } = useLoginIntent();

  return (
    <Page loading={loading} height="100vh">
      <LoginContainer onClickRegisterButton={() => onEvent({ type: 'ON_CLICK_REGISTER_BUTTON'} )}>
        <LoginFields
          loading={loading}
          email={state.email}
          password={state.password}
          onEmailChange={(email) => onEvent({ type: 'ON_EMAIL_CHANGE', email })}
          onPasswordChange={(password) => onEvent({ type: 'ON_PASSWORD_CHANGE', password })}
          onClickLoginButton={() => onEvent({ type: 'ON_CLICK_LOGIN_BUTTON' })}
        />
      </LoginContainer>
    </Page>
  );
};

export default LoginPage;