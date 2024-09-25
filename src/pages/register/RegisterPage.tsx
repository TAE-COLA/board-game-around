import { useRegisterIntent } from 'pages';
import React from 'react';
import { Page, RegisterContainer, RegisterFields } from 'widgets';

const RegisterPage: React.FC = () => {
  const intent = useRegisterIntent();

  return (
    <Page loading= {intent.loading} height="100vh">
      <RegisterContainer>
        <RegisterFields
          email={intent.state.email}
          emailDuplicate={intent.state.emailDuplicate}
          password={intent.state.password}
          passwordConfirm={intent.state.passwordConfirm}
          nickname={intent.state.nickname}
          valid={intent.state.valid}
          onEmailChange={(email) => intent.onEvent({ type: 'ON_EMAIL_CHANGE', email })}
          onClickCheckForDuplicatesButton={() => intent.onEvent({ type: 'ON_CLICK_CHECK_FOR_DUPLICATES_BUTTON' })}
          onPasswordChange={(password) => intent.onEvent({ type: 'ON_PASSWORD_CHANGE', password })}
          onPasswordConfirmChange={(passwordConfirm) => intent.onEvent({ type: 'ON_PASSWORD_CONFIRM_CHANGE', passwordConfirm })}
          onNicknameChange={(nickname) => intent.onEvent({ type: 'ON_NICKNAME_CHANGE', nickname })}
          onClickSubmitButton={() => intent.onEvent({ type: 'ON_CLICK_SUBMIT_BUTTON' })}
        />
      </RegisterContainer>
    </Page>
  );
};

export default RegisterPage;