import { UserApi } from 'features';
import { useEffect, useReducer, useState } from 'react';
import { CommonToast, launch } from 'shared';
import * as Intent from './Register.intent';

export function useRegisterIntent() {
  const [state, dispatch] = useReducer(Intent.reducer, new Intent.State({}));
  const [loading, setLoading] = useState(true);

  const [sideEffect, setSideEffect] = useState<Intent.SideEffect>();

  const onEvent: Intent.Event = {
    onEmailChange: (email) => {
      const emailField = {
        label: 'email' as const,
        value: email,
        error: checkValidity(email, 'email'),
      };
      const nextState = new Intent.State({ ...state, email: emailField, emailDuplicate: null });

      dispatch({
        type: 'UPDATE_EMAIL',
        email: emailField,
      });
      dispatch({ type: 'UPDATE_EMAIL_DUPLICATE', emailDuplicate: null });
      dispatch({ type: 'UPDATE_VALID', valid: checkValid(nextState) });
    },
    onClickCheckForDuplicatesButton: () => {
      UserApi.checkForEmailDuplicates(state.email.value).then((emailDuplicate) => {
        const emailField = {
          label: 'email' as const,
          value: state.email.value,
          error: emailDuplicate ? '중복된 이메일입니다.' : null,
        };
        const nextState = new Intent.State({ ...state, email: emailField, emailDuplicate });

        dispatch({
          type: 'UPDATE_EMAIL',
          email: emailField,
        });
        dispatch({ type: 'UPDATE_EMAIL_DUPLICATE', emailDuplicate });
        dispatch({ type: 'UPDATE_VALID', valid: checkValid(nextState) });
      });
    },
    onPasswordChange: (password) => {
      const passwordField = {
        label: 'password' as const,
        value: password,
        error: checkValidity(password, 'password'),
      };
      const passwordConfirmField = {
        ...state.passwordConfirm,
        error: checkValidity(state.passwordConfirm.value, 'passwordConfirm', password),
      };
      const nextState = new Intent.State({
        ...state,
        password: passwordField,
        passwordConfirm: passwordConfirmField,
      });

      dispatch({
        type: 'UPDATE_PASSWORD',
        password: passwordField,
      });
      dispatch({ type: 'UPDATE_PASSWORD_CONFIRM', passwordConfirm: passwordConfirmField });
      dispatch({ type: 'UPDATE_VALID', valid: checkValid(nextState) });
    },
    onPasswordConfirmChange: (passwordConfirm) => {
      const passwordConfirmField = {
        label: 'passwordConfrim' as const,
        value: passwordConfirm,
        error: checkValidity(passwordConfirm, 'passwordConfirm', state.password.value),
      };
      const nextState = new Intent.State({ ...state, passwordConfirm: passwordConfirmField });

      dispatch({
        type: 'UPDATE_PASSWORD_CONFIRM',
        passwordConfirm: passwordConfirmField,
      });
      dispatch({ type: 'UPDATE_VALID', valid: checkValid(nextState) });
    },
    onNicknameChange: (nickname) => {
      const nicknameField = {
        label: 'nickname' as const,
        value: nickname,
        error: checkValidity(nickname, 'nickname'),
      };
      const nextState = new Intent.State({ ...state, nickname: nicknameField });

      dispatch({
        type: 'UPDATE_NICKNAME',
        nickname: nicknameField,
      });
      dispatch({ type: 'UPDATE_VALID', valid: checkValid(nextState) });
    },
    onClickSubmitButton: () => {
      launch(setLoading, async () => {
        await UserApi.signUpWithEmailAndPassword(
          state.email.value,
          state.password.value,
          state.nickname.value
        );
        setSideEffect({ type: 'SHOW_TOAST', options: CommonToast.REGIST_SUCCESS });
        setSideEffect({ type: 'NAVIGATE_TO_MAIN' });
      });
    },
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (UserApi.hasSession()) {
        setSideEffect({ type: 'SHOW_TOAST', options: CommonToast.ALREADY_LOGIN });
        setSideEffect({ type: 'NAVIGATE_TO_MAIN' });
      } else {
        setLoading(false);
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, []);

  return { state, loading, onEvent, sideEffect };
}

function checkValidity(
  value: string,
  type: 'email' | 'password' | 'passwordConfirm' | 'nickname',
  password?: string
): string | null {
  if (value.length === 0) return null;

  switch (type) {
    case 'email': {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return !emailRegex.test(value) ? '이메일 형식이 올바르지 않습니다.' : null;
    }
    case 'password':
      return value.length < 8 ? '비밀번호는 8자 이상이어야 합니다.' : null;
    case 'passwordConfirm':
      return value !== password ? '비밀번호가 일치하지 않습니다.' : null;
    case 'nickname':
      return value.length < 2 || value.length > 10
        ? '닉네임은 2자 이상 10자 이하로 입력하세요.'
        : null;
    default:
      return null;
  }
}

function checkValid(state: Intent.State): boolean {
  if (state.email.error !== null || state.email.value.length === 0) return false;
  if (state.password.error !== null || state.password.value.length === 0) return false;
  if (state.passwordConfirm.error !== null || state.passwordConfirm.value.length === 0)
    return false;
  if (state.nickname.error !== null || state.nickname.value.length === 0) return false;
  if (state.emailDuplicate !== false) return false;
  return true;
}
