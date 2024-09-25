import { useLoginIntent } from 'pages';
import React from 'react';
import { LoginContainer, LoginFields, Page } from 'widgets';

const LoginPage: React.FC = () => {
  const intent = useLoginIntent();

  return (
    <Page loading={intent.loading} height="100vh">
      <LoginContainer 
        onClickRegisterButton={() => intent.onEvent({ type: 'ON_CLICK_REGISTER_BUTTON'} )}
      >
        <LoginFields
          loading={intent.loading}
          email={intent.state.email}
          password={intent.state.password}
          onEmailChange={(email) => intent.onEvent({ type: 'ON_EMAIL_CHANGE', email })}
          onPasswordChange={(password) => intent.onEvent({ type: 'ON_PASSWORD_CHANGE', password })}
          onClickLoginButton={() => intent.onEvent({ type: 'ON_CLICK_LOGIN_BUTTON' })}
        />
      </LoginContainer>
    </Page>
  );
};

export default LoginPage;