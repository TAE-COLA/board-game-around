import { FormData } from 'models';

type RegisterState = {
  email: FormData<'email', string>;
  emailDuplicate: boolean | null;
  password: FormData<'password', string>;
  passwordConfirm: FormData<'passwordConfrim', string>;
  nickname: FormData<'nickname', string>;
  valid: boolean;
};

const initialState: RegisterState = {
  email: { label: 'email', value: '', error: null },
  emailDuplicate: null,
  password: { label: 'password', value: '', error: null },
  passwordConfirm: { label: 'passwordConfrim', value: '', error: null },
  nickname: { label: 'nickname', value: '', error: null },
  valid: false,
};

type RegisterEvent =
  | { type: 'ON_EMAIL_CHANGE'; email: string }
  | { type: 'ON_CLICK_CHECK_FOR_DUPLICATES_BUTTON' }
  | { type: 'ON_PASSWORD_CHANGE'; password: string }
  | { type: 'ON_PASSWORD_CONFIRM_CHANGE'; passwordConfirm: string }
  | { type: 'ON_NICKNAME_CHANGE'; nickname: string }
  | { type: 'ON_CLICK_SUBMIT_BUTTON' };

type RegisterReduce =
  | { type: 'EMAIL'; email: FormData<'email', string> }
  | { type: 'EMAIL_DUPLICATE'; emailDuplicate: boolean | null }
  | { type: 'PASSWORD'; password: FormData<'password', string> }
  | { type: 'PASSWORD_CONFIRM'; passwordConfirm: FormData<'passwordConfrim', string> }
  | { type: 'NICKNAME'; nickname: FormData<'nickname', string> }
  | { type: 'VALID'; valid: boolean };

const handleRegisterReduce = (state: RegisterState, reduce: RegisterReduce): RegisterState => {
  switch (reduce.type) {
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
};

export {
  RegisterEvent as event,
  initialState,
  RegisterReduce as reduce,
  handleRegisterReduce as reducer,
  RegisterState as state,
};
