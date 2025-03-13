import { useToast } from '@chakra-ui/react';
import { Paths } from 'app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useEffect, useReducer, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CommonToast, launch } from 'shared';
import * as Intent from './LoginIntent';

export function useLoginIntent() {
  const navigate = useNavigate();
  const toast = useToast();
  const firebaseAuth = getAuth();

  const [state, dispatch] = useReducer(Intent.reducer, Intent.initialState);
  const [loading, setLoading] = useState(true);

  const onEvent: Intent.event = {
    onEmailChange: (email) => {
      dispatch({ type: 'EMAIL', email });
    },
    onPasswordChange: (password) => {
      dispatch({ type: 'PASSWORD', password });
    },
    onClickLoginButton: () => {
      launch(setLoading, async () => {
        try {
          await signInWithEmailAndPassword(firebaseAuth, state.email, state.password);
          toast(CommonToast.LOGIN_SUCCESS);
          navigate(Paths.main, { replace: true });
        } catch {
          toast(CommonToast.LOGIN_FAILED);
        }
      });
    },
    onClickRegisterButton: () => {
      navigate(Paths.register);
    },
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (firebaseAuth.currentUser) {
        navigate(Paths.main, { replace: true });
        toast(CommonToast.ALREADY_LOGIN);
      } else {
        setLoading(false);
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [firebaseAuth.currentUser]);

  return { state, loading, onEvent };
}
