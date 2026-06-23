import { FormData } from 'shared';
import { ToastOptions } from 'shared';

class State {
  email: FormData<'email', string> = { label: 'email', value: '', error: null };
  emailDuplicate: boolean | null = null;
  password: FormData<'password', string> = { label: 'password', value: '', error: null };
  passwordConfirm: FormData<'passwordConfrim', string> = {
    label: 'passwordConfrim',
    value: '',
    error: null,
  };
  nickname: FormData<'nickname', string> = { label: 'nickname', value: '', error: null };
  valid: boolean = false;

  constructor(state: Partial<State>) {
    Object.assign(this, state);
  }
}

type Event = {
  onEmailChange: (email: string) => void;
  onClickCheckForDuplicatesButton: () => void;
  onPasswordChange: (password: string) => void;
  onPasswordConfirmChange: (passwordConfirm: string) => void;
  onNicknameChange: (nickname: string) => void;
  onClickSubmitButton: () => void;
};

type Reduce =
  | { type: 'UPDATE_EMAIL'; email: FormData<'email', string> }
  | { type: 'UPDATE_EMAIL_DUPLICATE'; emailDuplicate: boolean | null }
  | { type: 'UPDATE_PASSWORD'; password: FormData<'password', string> }
  | { type: 'UPDATE_PASSWORD_CONFIRM'; passwordConfirm: FormData<'passwordConfrim', string> }
  | { type: 'UPDATE_NICKNAME'; nickname: FormData<'nickname', string> }
  | { type: 'UPDATE_VALID'; valid: boolean };

const handleReduce = (state: State, reduce: Reduce): State => {
  switch (reduce.type) {
    case 'UPDATE_EMAIL':
      return { ...state, email: reduce.email };
    case 'UPDATE_EMAIL_DUPLICATE':
      return { ...state, emailDuplicate: reduce.emailDuplicate };
    case 'UPDATE_PASSWORD':
      return { ...state, password: reduce.password };
    case 'UPDATE_PASSWORD_CONFIRM':
      return { ...state, passwordConfirm: reduce.passwordConfirm };
    case 'UPDATE_NICKNAME':
      return { ...state, nickname: reduce.nickname };
    case 'UPDATE_VALID':
      return { ...state, valid: reduce.valid };
    default:
      return state;
  }
};

type SideEffect =
  | { type: 'NAVIGATE_TO_MAIN' }
  | { type: 'SHOW_TOAST'; options: ToastOptions }
  | undefined;

export { Event, Reduce, handleReduce as reducer, SideEffect, State };
