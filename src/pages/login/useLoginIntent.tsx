import { useToast } from '@chakra-ui/react';
import { useAuth } from 'features';
import { useEffect, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import { launch } from 'shared';

type LoginState = {
  loading: boolean;
  email: string;
  password: string;
};

type LoginEvent =
  | { type: 'ON_EMAIL_CHANGE'; email: string }
  | { type: 'ON_PASSWORD_CHANGE'; password: string }
  | { type: 'ON_CLICK_LOGIN_BUTTON' }
  | { type: 'ON_CLICK_REGISTER_BUTTON' };

type LoginReduce =
  | { type: 'LOADING'; loading: boolean }
  | { type: 'EMAIL'; email: string }
  | { type: 'PASSWORD'; password: string };

function handleLoginReduce(state: LoginState, reduce: LoginReduce): LoginState {
  switch (reduce.type) {
    case 'LOADING':
      return { ...state, loading: reduce.loading };
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
    loading: false,
    email: '',
    password: ''
  };
  const [state, dispatch] = useReducer(handleLoginReduce, initialState);

  const navigate = useNavigate();
  const toast = useToast();

  const { user, loading, login } = useAuth();

  const onEvent = async (event: LoginEvent) => {
    switch (event.type) {
      case 'ON_EMAIL_CHANGE':
        dispatch({ type: 'EMAIL', email: event.email });
        break;
      case 'ON_PASSWORD_CHANGE':
        dispatch({ type: 'PASSWORD', password: event.password });
        break;
      case 'ON_CLICK_LOGIN_BUTTON':
        await launch(dispatch, async () => {
          await login(state.email, state.password, () => { 
            navigate('/main', { replace: true }) 
          });
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
    if (loading) return;
    
    if (user) { 
      navigate('/main', { replace: true });
      toast({ title: '이미 로그인되어 있습니다.', duration: 2000 });
    }
  }, [user, loading]);

  return {
    state,
    onEvent,
  };
}