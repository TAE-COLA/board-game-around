import { ToastOptions } from 'shared';

class State {
  email: string = '';
  password: string = '';

  constructor(state: Partial<State>) {
    Object.assign(this, state);
  }
}

type Event = {
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onClickLoginButton: () => void;
  onClickRegisterButton: () => void;
};

type Reduce =
  | { type: 'UPDATE_EMAIL'; email: string }
  | { type: 'UPDATE_PASSWORD'; password: string };

const handleReduce = (state: State, reduce: Reduce): State => {
  switch (reduce.type) {
    case 'UPDATE_EMAIL':
      return { ...state, email: reduce.email };
    case 'UPDATE_PASSWORD':
      return { ...state, password: reduce.password };
    default:
      return state;
  }
};

type SideEffect =
  | { type: 'NAVIGATE_TO_REGISTER' }
  | { type: 'NAVIGATE_TO_MAIN' }
  | { type: 'SHOW_TOAST'; options: ToastOptions }
  | undefined;

export { Event, Reduce, handleReduce as reducer, SideEffect, State };
