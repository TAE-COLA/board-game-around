import { useToast } from '@chakra-ui/react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useEffect, useReducer, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { launch } from 'shared';

type LoginState = {
  email: string;
  password: string;
};

type LoginEvent =
  | { type: 'SCREEN_INITIALIZE' }
  | { type: 'ON_EMAIL_CHANGE'; email: string }
  | { type: 'ON_PASSWORD_CHANGE'; password: string }
  | { type: 'ON_CLICK_LOGIN_BUTTON' }
  | { type: 'ON_CLICK_REGISTER_BUTTON' };

type LoginReduce =
  | { type: 'EMAIL'; email: string }
  | { type: 'PASSWORD'; password: string };

function handleLoginReduce(state: LoginState, reduce: LoginReduce): LoginState {
  switch (reduce.type) {
    case 'EMAIL':
      return { ...state, email: reduce.email };
    case 'PASSWORD':
      return { ...state, password: reduce.password };
    default:
      return state;
  }
}

export function useLoginIntent() {
  const initialState: LoginState = {
    email: '',
    password: ''
  };
  const [state, dispatch] = useReducer(handleLoginReduce, initialState);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const toast = useToast();
  const firebaseAuth = getAuth();

  const onEvent = async (event: LoginEvent) => {
    switch (event.type) {
      case 'SCREEN_INITIALIZE':
        if (firebaseAuth.currentUser) {
          navigate('/main', { replace: true });
          toast({ title: '이미 로그인되어 있습니다.', duration: 2000 });
        }
        setLoading(false);
        break;
      case 'ON_EMAIL_CHANGE':
        dispatch({ type: 'EMAIL', email: event.email });
        break;
      case 'ON_PASSWORD_CHANGE':
        dispatch({ type: 'PASSWORD', password: event.password });
        break;
      case 'ON_CLICK_LOGIN_BUTTON':
        await launch(setLoading, async () => {
          try {
            await signInWithEmailAndPassword(firebaseAuth, state.email, state.password);
            toast({ title: '로그인이 완료되었습니다.', status: 'success', duration: 2000 });
            navigate('/main', { replace: true }) 
          } catch (error) {
            toast({ title: '로그인에 실패했습니다.', status: 'error', duration: 2000 });
          }
        });
        break;
      case 'ON_CLICK_REGISTER_BUTTON':
        navigate('/register');
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      onEvent({ type: 'SCREEN_INITIALIZE' });
    }, 1000);

    return () => clearTimeout(timeout); // 컴포넌트 언마운트 시 타이머 해제
  }, []);

  return {
    state,
    loading,
    onEvent
  };
}