import { PageProps, Paths } from 'app';
import React, { useEffect } from 'react';
import { Page } from 'shared/ui';
import { RegisterContainer, RegisterFields } from '../ui';
import { useRegisterIntent } from './useRegisterIntent';

export const RegisterPage: React.FC<PageProps> = ({ navigate, toast }) => {
  const { state, loading, actionPending, clearSideEffects, onEvent, sideEffects } =
    useRegisterIntent();

  useEffect(() => {
    if (sideEffects.length === 0) return;

    sideEffects.forEach((sideEffect) => {
      switch (sideEffect.type) {
        case 'NAVIGATE_TO_MAIN':
          navigate(Paths.main);
          break;
        case 'SHOW_TOAST':
          toast(sideEffect.options);
          break;
      }
    });
    clearSideEffects();
  }, [clearSideEffects, navigate, sideEffects, toast]);

  return (
    <Page loading={loading} minHeight='100dvh'>
      <RegisterContainer>
        <RegisterFields
          email={state.email}
          emailDuplicate={state.emailDuplicate}
          password={state.password}
          passwordConfirm={state.passwordConfirm}
          nickname={state.nickname}
          valid={state.valid}
          checkEmailLoading={!!actionPending.checkEmail}
          submitLoading={!!actionPending.submit}
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
