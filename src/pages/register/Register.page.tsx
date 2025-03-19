import { PageProps, Paths } from 'app';
import React, { useEffect } from 'react';
import { Page, RegisterContainer, RegisterFields } from 'widgets';
import { useRegisterIntent } from './useRegisterIntent';

export const RegisterPage: React.FC<PageProps> = ({ navigate, toast }) => {
  const { state, loading, onEvent, sideEffect } = useRegisterIntent();

  useEffect(() => {
    switch (sideEffect?.type) {
      case 'NAVIGATE_TO_MAIN':
        navigate(Paths.main);
        break;
      case 'SHOW_TOAST':
        toast(sideEffect.options);
        break;
    }
  }, [sideEffect]);

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
