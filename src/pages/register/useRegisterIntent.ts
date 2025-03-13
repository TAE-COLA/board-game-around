import { useToast } from '@chakra-ui/react';
import { Paths } from 'app';
import { checkEmailForDuplicate, signUpWithEmailAndPassword } from 'features';
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

  const onEvent = async (event: Intent.event) => {
    switch (event.type) {
      case 'ON_EMAIL_CHANGE':
        dispatch({
          type: 'EMAIL',
          email: { label: 'email', value: event.email, error: checkValidity(event.email, 'email') },
        });
        dispatch({ type: 'VALID', valid: checkValid(state) });
        break;
      case 'ON_CLICK_CHECK_FOR_DUPLICATES_BUTTON': {
        const emailDuplicate = await checkEmailForDuplicate(state.email.value);
        dispatch({
          type: 'EMAIL',
          email: { label: 'email', value: state.email.value, error: emailDuplicate ? '중복된 이메일입니다.' : null },
        });
        dispatch({ type: 'EMAIL_DUPLICATE', emailDuplicate: emailDuplicate });
        dispatch({ type: 'VALID', valid: checkValid(state) });
        break;
      }
      case 'ON_PASSWORD_CHANGE':
        dispatch({
          type: 'PASSWORD',
          password: { label: 'password', value: event.password, error: checkValidity(event.password, 'password') },
        });
        dispatch({ type: 'VALID', valid: checkValid(state) });
        break;
      case 'ON_PASSWORD_CONFIRM_CHANGE':
        dispatch({
          type: 'PASSWORD_CONFIRM',
          passwordConfirm: {
            label: 'passwordConfrim',
            value: event.passwordConfirm,
            error: checkValidity(event.passwordConfirm, 'passwordConfirm', state.password.value),
          },
        });
        dispatch({ type: 'VALID', valid: checkValid(state) });
        break;
      case 'ON_NICKNAME_CHANGE':
        dispatch({
          type: 'NICKNAME',
          nickname: { label: 'nickname', value: event.nickname, error: checkValidity(event.nickname, 'nickname') },
        });
        dispatch({ type: 'VALID', valid: checkValid(state) });
        break;
      case 'ON_CLICK_SUBMIT_BUTTON':
        await launch(setLoading, async () => {
          await signUpWithEmailAndPassword(state.email.value, state.password.value, state.nickname.value);
        });
        toast(CommonToast.REGIST_SUCCESS);
        navigate(Paths.main, { replace: true });
        break;
    }
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
      return value.length < 2 || value.length > 10 ? '닉네임은 2자 이상 10자 이하로 입력하세요.' : null;
    default:
      return null;
  }
}

function checkValid(state: Intent.state): boolean {
  if (state.email.error !== null || state.email.value.length === 0) return false;
  if (state.password.error !== null || state.password.value.length === 0) return false;
  if (state.passwordConfirm.error !== null || state.passwordConfirm.value.length === 0) return false;
  if (state.nickname.error !== null || state.nickname.value.length === 0) return false;
  if (state.emailDuplicate === true) return false;
  return true;
}
