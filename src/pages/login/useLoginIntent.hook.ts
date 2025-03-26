import { UserApi } from 'features';
import { useEffect, useReducer, useState } from 'react';
import { CommonToast, launch } from 'shared';
import { createState, Event, reducer, Reduces, SideEffect, SideEffects } from './Login.intent';

export function useLoginIntent() {
  const [state, dispatch] = useReducer(reducer, createState());
  const [loading, setLoading] = useState(true);

  const [sideEffect, setSideEffect] = useState<SideEffect>();

  const onEvent: Event = {
    onEmailChange: (email) => {
      dispatch({ type: Reduces.UPDATE_EMAIL, email });
    },
    onPasswordChange: (password) => {
      dispatch({ type: Reduces.UPDATE_PASSWORD, password });
    },
    onClickLoginButton: () => {
      launch(setLoading, async () => {
        try {
          UserApi.login(state.email, state.password);
          setSideEffect({ type: SideEffects.SHOW_TOAST, options: CommonToast.LOGIN_SUCCESS });
          setSideEffect({ type: SideEffects.NAVIGATE_TO_MAIN });
        } catch {
          setSideEffect({ type: SideEffects.SHOW_TOAST, options: CommonToast.LOGIN_FAILED });
        }
      });
    },
    onClickRegisterButton: () => {
      setSideEffect({ type: SideEffects.NAVIGATE_TO_REGISTER });
    },
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (UserApi.hasSession()) {
        setSideEffect({ type: SideEffects.SHOW_TOAST, options: CommonToast.ALREADY_LOGIN });
        setSideEffect({ type: SideEffects.NAVIGATE_TO_MAIN });
      } else {
        setLoading(false);
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, []);

  return { state, loading, onEvent, sideEffect };
}
