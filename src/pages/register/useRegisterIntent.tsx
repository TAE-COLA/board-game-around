import { useToast } from '@chakra-ui/react';
import { useReducer } from 'react';
import { useNavigate } from 'react-router-dom';

type RegisterState = {
  loading: boolean;
  email: string;
  password: string;
  passwordConfirm: string;
  nickname: string;
  birthday: Date;
};

type RegisterEvent =
  | { type: 'ON_EMAIL_CHANGE'; email: string }
  | { type: 'ON_CLICK_CHECK_FOR_DUPLICATES_BUTTON' }
  | { type: 'ON_PASSWORD_CHANGE'; password: string }
  | { type: 'ON_PASSWORD_CONFIRM_CHANGE'; passwordConfirm: string }
  | { type: 'ON_NICKNAME_CHANGE'; nickname: string }
  | { type: 'ON_BIRTHDAY_CHANGE'; birthday: Date }
  | { type: 'ON_CLICK_SUBMIT_BUTTON' };

type RegisterReduce =
  | { type: 'LOADING'; loading: boolean }
  | { type: 'EMAIL'; email: string }
  | { type: 'PASSWORD'; password: string }
  | { type: 'PASSWORD_CONFIRM'; passwordConfirm: string }
  | { type: 'NICKNAME'; nickname: string }
  | { type: 'BIRTHDAY'; birthday: Date };

function handleRegisterReduce(state: RegisterState, reduce: RegisterReduce): RegisterState {
  switch (reduce.type) {
    case 'LOADING':
      return { ...state, loading: reduce.loading };
    case 'EMAIL':
      return { ...state, email: reduce.email };
    case 'PASSWORD':
      return { ...state, password: reduce.password };
    case 'PASSWORD_CONFIRM':
      return { ...state, passwordConfirm: reduce.passwordConfirm };
    case 'NICKNAME':
      return { ...state, nickname: reduce.nickname };
    case 'BIRTHDAY':
      return { ...state, birthday: reduce.birthday };
    default:
      return state;
  }
}

export function useRegisterIntent() {
  const initialState: RegisterState = {
    loading: false,
    email: '',
    password: '',
    passwordConfirm: '',
    nickname: '',
    birthday: new Date(),
  };
  const [state, dispatch] = useReducer(handleRegisterReduce, initialState);

  const navigate = useNavigate();
  const toast = useToast();

  const onEvent = async (event: RegisterEvent) => {
    switch (event.type) {
      case 'ON_EMAIL_CHANGE':
        dispatch({ type: 'EMAIL', email: event.email });
        break;
      case 'ON_CLICK_CHECK_FOR_DUPLICATES_BUTTON':
        // TODO: 중복확인 버튼 클릭 시 이벤트 처리
        break;
      case 'ON_PASSWORD_CHANGE':
        dispatch({ type: 'PASSWORD', password: event.password });
        break;
      case 'ON_PASSWORD_CONFIRM_CHANGE':
        dispatch({ type: 'PASSWORD_CONFIRM', passwordConfirm: event.passwordConfirm });
        break;
      case 'ON_NICKNAME_CHANGE':
        dispatch({ type: 'NICKNAME', nickname: event.nickname });
        break;
      case 'ON_BIRTHDAY_CHANGE':
        dispatch({ type: 'BIRTHDAY', birthday: event.birthday });
        break;
      case 'ON_CLICK_SUBMIT_BUTTON':
        // TODO: 회원가입 버튼 클릭 시 이벤트 처리
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