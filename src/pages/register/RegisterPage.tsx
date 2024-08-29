import { useRegisterIntent } from 'pages';
import React from 'react';
import { Page, RegisterContainer, RegisterFields } from 'widgets';

const RegisterPage: React.FC = () => {
  const { state, onEvent } = useRegisterIntent();

  return (
    <Page>
      <RegisterContainer>
        <RegisterFields
          email={state.email}
          emailDuplicate={state.emailDuplicate}
          password={state.password}
          passwordConfirm={state.passwordConfirm}
          nickname={state.nickname}
          birthday={state.birthday}
          valid={state.valid}
          onEmailChange={(email) => onEvent({ type: 'ON_EMAIL_CHANGE', email })}
          onClickCheckForDuplicatesButton={() => onEvent({ type: 'ON_CLICK_CHECK_FOR_DUPLICATES_BUTTON' })}
          onPasswordChange={(password) => onEvent({ type: 'ON_PASSWORD_CHANGE', password })}
          onPasswordConfirmChange={(passwordConfirm) => onEvent({ type: 'ON_PASSWORD_CONFIRM_CHANGE', passwordConfirm })}
          onNicknameChange={(nickname) => onEvent({ type: 'ON_NICKNAME_CHANGE', nickname })}
          onBirthdayChange={(birthday) => onEvent({ type: 'ON_BIRTHDAY_CHANGE', birthday })}
          onClickSubmitButton={() => onEvent({ type: 'ON_CLICK_SUBMIT_BUTTON' })}
        />
      </RegisterContainer>
    </Page>
  );
};

export default RegisterPage;