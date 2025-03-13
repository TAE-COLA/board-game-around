import { useRegisterIntent } from 'pages';
import React from 'react';
import { Page, RegisterContainer, RegisterFields } from 'widgets';

export const RegisterPage: React.FC = () => {
  const { state, loading, onEvent } = useRegisterIntent();

  return (
    <Page loading={loading} height='100vh'>
      <RegisterContainer>
        <RegisterFields
          email={state.email}
          emailDuplicate={state.emailDuplicate}
          password={state.password}
          passwordConfirm={state.passwordConfirm}
          nickname={state.nickname}
          valid={state.valid}
          onEmailChange={onEvent.onEmailChange}
          onClickCheckForDuplicatesButton={onEvent.onClickCheckForDuplicatesButton}
          onPasswordChange={onEvent.onPasswordChange}
          onPasswordConfirmChange={onEvent.onPasswordConfirmChange}
          onNicknameChange={onEvent.onNicknameChange}
          onClickSubmitButton={onEvent.onClickSubmitButton}
        />
      </RegisterContainer>
    </Page>
  );
};
