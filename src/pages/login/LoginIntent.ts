type LoginState = {
  email: string;
  password: string;
};

const initialState: LoginState = {
  email: '',
  password: '',
};

type LoginEvent =
  | { type: 'ON_EMAIL_CHANGE'; email: string }
  | { type: 'ON_PASSWORD_CHANGE'; password: string }
  | { type: 'ON_CLICK_LOGIN_BUTTON' }
  | { type: 'ON_CLICK_REGISTER_BUTTON' };

type LoginReduce = { type: 'EMAIL'; email: string } | { type: 'PASSWORD'; password: string };

const handleLoginReduce = (state: LoginState, reduce: LoginReduce): LoginState => {
  switch (reduce.type) {
    case 'EMAIL':
      return { ...state, email: reduce.email };
    case 'PASSWORD':
      return { ...state, password: reduce.password };
    default:
      return state;
  }
};

export { LoginEvent as event, initialState, LoginReduce as reduce, handleLoginReduce as reducer, LoginState as state };
