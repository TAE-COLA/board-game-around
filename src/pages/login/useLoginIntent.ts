import { UserApi } from 'features';
import { useEffect, useReducer, useState } from 'react';
import { CommonToast, launch } from 'shared';
import * as Intent from './Login.intent';

export function useLoginIntent() {
  const [state, dispatch] = useReducer(Intent.reducer, new Intent.State({}));
  const [loading, setLoading] = useState(true);

  const [sideEffect, setSideEffect] = useState<Intent.SideEffect>();

  const onEvent: Intent.Event = {
    onEmailChange: (email) => {
      dispatch({ type: 'UPDATE_EMAIL', email });
    },
    onPasswordChange: (password) => {
      dispatch({ type: 'UPDATE_PASSWORD', password });
    },
    onClickLoginButton: () => {
      launch(setLoading, async () => {
        try {
          await UserApi.login(state.email, state.password);
          setSideEffect({ type: 'SHOW_TOAST', options: CommonToast.LOGIN_SUCCESS });
          setSideEffect({ type: 'NAVIGATE_TO_MAIN' });
        } catch {
          setSideEffect({ type: 'SHOW_TOAST', options: CommonToast.LOGIN_FAILED });
        }
      });
    },
    onClickRegisterButton: () => {
      setSideEffect({ type: 'NAVIGATE_TO_REGISTER' });
    },
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (UserApi.hasSession()) {
        setSideEffect({ type: 'SHOW_TOAST', options: CommonToast.ALREADY_LOGIN });
        setSideEffect({ type: 'NAVIGATE_TO_MAIN' });
      } else {
        setLoading(false);
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, []);

  return { state, loading, onEvent, sideEffect };
}
