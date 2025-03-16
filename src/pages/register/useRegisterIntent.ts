import { useToast } from '@chakra-ui/react';
import { Paths } from 'app';
import { UserApi } from 'features';
import { getAuth } from 'firebase/auth';
import { useEffect, useReducer, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CommonToast, launch } from 'shared';
import * as Intent from './RegisterIntent';

export function useRegisterIntent() {
  const [state, dispatch] = useReducer(Intent.reducer, Intent.initialState);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const toast = useToast();
  const auth = getAuth();

  const onEvent: Intent.event = {
    onEmailChange: (email) => {
      dispatch({
        type: 'EMAIL',
        email: { label: 'email', value: email, error: checkValidity(email, 'email') },
      });
      dispatch({ type: 'VALID', valid: checkValid(state) });
    },
    onClickCheckForDuplicatesButton: () => {
      UserApi.checkForEmailDuplicates(state.email.value).then((emailDuplicate) => {
        dispatch({
          type: 'EMAIL',
          email: {
            label: 'email',
            value: state.email.value,
            error: emailDuplicate ? '중복된 이메일입니다.' : null,
          },
        });
        dispatch({ type: 'EMAIL_DUPLICATE', emailDuplicate });
        dispatch({ type: 'VALID', valid: checkValid(state) });
      });
    },
    onPasswordChange: (password) => {
      dispatch({
        type: 'PASSWORD',
        password: {
          label: 'password',
          value: password,
          error: checkValidity(password, 'password'),
        },
      });
      dispatch({ type: 'VALID', valid: checkValid(state) });
    },
    onPasswordConfirmChange: (passwordConfirm) => {
      dispatch({
        type: 'PASSWORD_CONFIRM',
        passwordConfirm: {
          label: 'passwordConfrim',
          value: passwordConfirm,
          error: checkValidity(passwordConfirm, 'passwordConfirm', state.password.value),
        },
      });
      dispatch({ type: 'VALID', valid: checkValid(state) });
    },
    onNicknameChange: (nickname) => {
      dispatch({
        type: 'NICKNAME',
        nickname: {
          label: 'nickname',
          value: nickname,
          error: checkValidity(nickname, 'nickname'),
        },
      });
      dispatch({ type: 'VALID', valid: checkValid(state) });
    },
    onClickSubmitButton: () => {
      launch(setLoading, async () => {
        await UserApi.signUpWithEmailAndPassword(
          state.email.value,
          state.password.value,
          state.nickname.value
        );

        toast(CommonToast.REGIST_SUCCESS);
        navigate(Paths.main, { replace: true });
      });
    },
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (auth.currentUser) {
        navigate(Paths.main, { replace: true });
        toast(CommonToast.ALREADY_LOGIN);
      } else {
        setLoading(false);
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [auth.currentUser]);

  return { state, loading, onEvent };
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

function checkValid(state: Intent.state): boolean {
  if (state.email.error !== null || state.email.value.length === 0) return false;
  if (state.password.error !== null || state.password.value.length === 0) return false;
  if (state.passwordConfirm.error !== null || state.passwordConfirm.value.length === 0)
    return false;
  if (state.nickname.error !== null || state.nickname.value.length === 0) return false;
  if (state.emailDuplicate === true) return false;
  return true;
}
