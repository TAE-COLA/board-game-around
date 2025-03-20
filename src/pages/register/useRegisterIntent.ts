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
      dispatch({
        type: 'UPDATE_EMAIL',
        email: { label: 'email', value: email, error: checkValidity(email, 'email') },
      });
      dispatch({ type: 'UPDATE_VALID', valid: checkValid(state) });
    },
    onClickCheckForDuplicatesButton: () => {
      UserApi.checkForEmailDuplicates(state.email.value).then((emailDuplicate) => {
        dispatch({
          type: 'UPDATE_EMAIL',
          email: {
            label: 'email',
            value: state.email.value,
            error: emailDuplicate ? '중복된 이메일입니다.' : null,
          },
        });
        dispatch({ type: 'UPDATE_EMAIL_DUPLICATE', emailDuplicate });
        dispatch({ type: 'UPDATE_VALID', valid: checkValid(state) });
      });
    },
    onPasswordChange: (password) => {
      dispatch({
        type: 'UPDATE_PASSWORD',
        password: {
          label: 'password',
          value: password,
          error: checkValidity(password, 'password'),
        },
      });
      dispatch({ type: 'UPDATE_VALID', valid: checkValid(state) });
    },
    onPasswordConfirmChange: (passwordConfirm) => {
      dispatch({
        type: 'UPDATE_PASSWORD_CONFIRM',
        passwordConfirm: {
          label: 'passwordConfrim',
          value: passwordConfirm,
          error: checkValidity(passwordConfirm, 'passwordConfirm', state.password.value),
        },
      });
      dispatch({ type: 'UPDATE_VALID', valid: checkValid(state) });
    },
    onNicknameChange: (nickname) => {
      dispatch({
        type: 'UPDATE_NICKNAME',
        nickname: {
          label: 'nickname',
          value: nickname,
          error: checkValidity(nickname, 'nickname'),
        },
      });
      dispatch({ type: 'UPDATE_VALID', valid: checkValid(state) });
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
  if (state.emailDuplicate === true) return false;
  return true;
}
