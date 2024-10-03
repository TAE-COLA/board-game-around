import { useRegisterIntent } from 'pages';
import React from 'react';
import { Page, RegisterContainer, RegisterFields } from 'widgets';

const RegisterPage: React.FC = () => {
  const { state, loading, onEvent} = useRegisterIntent();

  return (
    <Page loading={loading} height="100vh">
      <RegisterContainer>
        <RegisterFields
          email={state.email}
          emailDuplicate={state.emailDuplicate}
          password={state.password}
          passwordConfirm={state.passwordConfirm}
          nickname={state.nickname}
          valid={state.valid}
          onEmailChange={(email) => onEvent({ type: 'ON_EMAIL_CHANGE', email })}
          onClickCheckForDuplicatesButton={() => onEvent({ type: 'ON_CLICK_CHECK_FOR_DUPLICATES_BUTTON' })}
          onPasswordChange={(password) => onEvent({ type: 'ON_PASSWORD_CHANGE', password })}
          onPasswordConfirmChange={(passwordConfirm) => onEvent({ type: 'ON_PASSWORD_CONFIRM_CHANGE', passwordConfirm })}
          onNicknameChange={(nickname) => onEvent({ type: 'ON_NICKNAME_CHANGE', nickname })}
          onClickSubmitButton={() => onEvent({ type: 'ON_CLICK_SUBMIT_BUTTON' })}
        />
      </RegisterContainer>
    </Page>
  );
};

export default RegisterPage;