import { useToast } from '@chakra-ui/react';
import { checkEmailForDuplicate, signUpWithEmailAndPassword } from 'features';
import { useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormData } from 'shared';

type RegisterState = {
  loading: boolean;
  email: FormData<'email', string>;
  emailDuplicate: boolean | null;
  password: FormData<'password', string>;
  passwordConfirm: FormData<'passwordConfrim', string>;
  nickname: FormData<'nickname', string>;
  valid: boolean;
};

type RegisterEvent =
  | { type: 'ON_EMAIL_CHANGE'; email: string }
  | { type: 'ON_CLICK_CHECK_FOR_DUPLICATES_BUTTON' }
  | { type: 'ON_PASSWORD_CHANGE'; password: string }
  | { type: 'ON_PASSWORD_CONFIRM_CHANGE'; passwordConfirm: string }
  | { type: 'ON_NICKNAME_CHANGE'; nickname: string }
  | { type: 'ON_CLICK_SUBMIT_BUTTON' };

type RegisterReduce =
  | { type: 'LOADING'; loading: boolean }
  | { type: 'EMAIL'; email: FormData<'email', string> }
  | { type: 'EMAIL_DUPLICATE'; emailDuplicate: boolean | null }
  | { type: 'PASSWORD'; password: FormData<'password', string> }
  | { type: 'PASSWORD_CONFIRM'; passwordConfirm: FormData<'passwordConfrim', string> }
  | { type: 'NICKNAME'; nickname: FormData<'nickname', string> }
  | { type: 'VALID'; valid: boolean };

function handleRegisterReduce(state: RegisterState, reduce: RegisterReduce): RegisterState {
  switch (reduce.type) {
    case 'LOADING':
      return { ...state, loading: reduce.loading };
    case 'EMAIL':
      return { ...state, email: reduce.email };
    case 'EMAIL_DUPLICATE':
      return { ...state, emailDuplicate: reduce.emailDuplicate };
    case 'PASSWORD':
      return { ...state, password: reduce.password };
    case 'PASSWORD_CONFIRM':
      return { ...state, passwordConfirm: reduce.passwordConfirm };
    case 'NICKNAME':
      return { ...state, nickname: reduce.nickname };
    case 'VALID':
      return { ...state, valid: reduce.valid };
    default:
      return state;
  }
}

export function useRegisterIntent() {
  const initialState: RegisterState = {
    loading: false,
    email: { label: 'email', value: '', error: null },
    emailDuplicate: null,
    password: { label: 'password', value: '', error: null },
    passwordConfirm: { label: 'passwordConfrim', value: '', error: null },
    nickname: { label: 'nickname', value: '', error: null },
    valid: false,
  };
  const [state, dispatch] = useReducer(handleRegisterReduce, initialState);

  const navigate = useNavigate();
  const toast = useToast();

  const onEvent = async (event: RegisterEvent) => {
    switch (event.type) {
      case 'ON_EMAIL_CHANGE':
        dispatch({ type: 'EMAIL', email: { label: 'email', value: event.email, error: checkEmailValidity(event.email) } });
        dispatch({ type: 'VALID', valid: checkValid(state) });
        break;
      case 'ON_CLICK_CHECK_FOR_DUPLICATES_BUTTON':
        const emailDuplicate = await checkEmailForDuplicate(state.email.value);
        dispatch({ type: 'EMAIL', email: { label: 'email', value: state.email.value, error: emailDuplicate ? '중복된 이메일입니다.' : null } });
        dispatch({ type: 'EMAIL_DUPLICATE', emailDuplicate: emailDuplicate });
        dispatch({ type: 'VALID', valid: checkValid(state) });
        break;
      case 'ON_PASSWORD_CHANGE':
        dispatch({ type: 'PASSWORD', password: { label: 'password', value: event.password, error: checkPasswordValidity(event.password) } });
        dispatch({ type: 'VALID', valid: checkValid(state) });
        break;
      case 'ON_PASSWORD_CONFIRM_CHANGE':
        dispatch({ type: 'PASSWORD_CONFIRM', passwordConfirm: { label: 'passwordConfrim', value: event.passwordConfirm, error: checkPasswordConfirmValidity(state.password.value, event.passwordConfirm) } });
        dispatch({ type: 'VALID', valid: checkValid(state) });
        break;
      case 'ON_NICKNAME_CHANGE':
        dispatch({ type: 'NICKNAME', nickname: { label: 'nickname', value: event.nickname, error: checkNicknameValidity(event.nickname) } });
        dispatch({ type: 'VALID', valid: checkValid(state) });
        break;
      case 'ON_CLICK_SUBMIT_BUTTON':
        await signUpWithEmailAndPassword(state.email.value, state.password.value, state.nickname.value)
        toast({ title: '회원가입 완료', description: '회원가입이 완료됐습니다.', status: 'success', duration: 5000, isClosable: true });
        navigate('/main', { replace: true });
        break;
      default:
        break;
    }
  };

  return {
    state,
    onEvent,
  };
}

function checkEmailValidity(email: string): string | null {
  if (email.length === 0) { return null; }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return '이메일 형식이 올바르지 않습니다.';
  }

  return null;
}

function checkPasswordValidity(password: string): string | null {
  if (password.length === 0) { return null; }

  if (password.length < 8) {
    return '비밀번호는 8자 이상이어야 합니다.';
  }

  return null;
}

function checkPasswordConfirmValidity(password: string, passwordConfirm: string): string | null {
  if (passwordConfirm.length === 0) { return null; }

  if (password !== passwordConfirm) {
    return '비밀번호가 일치하지 않습니다.';
  }

  return null;
}

function checkNicknameValidity(nickname: string): string | null {
  if (nickname.length === 0) { return null; }

  if (nickname.length < 2 || 10 < nickname.length) {
    return '닉네임은 2자 이상 10자 이하로 입력하세요.';
  }

  return null;
}

function checkValid(state: RegisterState): boolean {
  if (state.email.error !== null || state.email.value.length === 0) {
    return false;
  }
  if (state.password.error !== null || state.password.value.length === 0) {
    return false;
  }
  if (state.passwordConfirm.error !== null || state.passwordConfirm.value.length === 0) {
    return false;
  }
  if (state.nickname.error !== null || state.nickname.value.length === 0) {
    return false;
  }
  if (state.emailDuplicate === true) {
    return false;
  }
  return true;
}