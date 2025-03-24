import { ToastOptions } from 'shared';

export type State = {
  email: string;
  password: string;
};

export const createState = (partial?: Partial<State>): State => ({
  email: '',
  password: '',
  ...partial,
});

export type Event = {
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onClickLoginButton: () => void;
  onClickRegisterButton: () => void;
};

export enum Reduces {
  UPDATE_EMAIL = 'UPDATE_EMAIL',
  UPDATE_PASSWORD = 'UPDATE_PASSWORD',
}

type Reduce =
  | { type: Reduces.UPDATE_EMAIL; email: string }
  | { type: Reduces.UPDATE_PASSWORD; password: string };

export const reducer = (state: State, reduce: Reduce): State => {
  switch (reduce.type) {
    case 'UPDATE_EMAIL':
      return { ...state, email: reduce.email };
    case 'UPDATE_PASSWORD':
      return { ...state, password: reduce.password };
    default:
      return state;
  }
};

export enum SideEffects {
  NAVIGATE_TO_REGISTER = 'NAVIGATE_TO_REGISTER',
  NAVIGATE_TO_MAIN = 'NAVIGATE_TO_MAIN',
  SHOW_TOAST = 'SHOW_TOAST',
}

export type SideEffect =
  | { type: SideEffects.NAVIGATE_TO_REGISTER }
  | { type: SideEffects.NAVIGATE_TO_MAIN }
  | { type: SideEffects.SHOW_TOAST; options: ToastOptions }
  | undefined;
