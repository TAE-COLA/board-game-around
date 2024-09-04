import { useToast } from '@chakra-ui/react';
import { User } from 'entities';
import { useAuth, useLounge } from 'features';
import { useEffect, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import { createDummy } from 'shared';

type YachtDiceState = {
  loading: boolean;
  user: User;
  members: User[];
};

type YachtDiceEvent =
  | { type: 'ON_CLICK_EXIT_BUTTON'; email: string };

type YachtDiceReduce =
  | { type: 'LOADING'; loading: boolean }
  | { type: 'USER'; user: User }
  | { type: 'MEMBERS'; members: User[] };

function handleYachtDiceReduce(state: YachtDiceState, reduce: YachtDiceReduce): YachtDiceState {
  switch (reduce.type) {
    case 'LOADING':
      return { ...state, loading: reduce.loading };
    case 'USER':
      return { ...state, user: reduce.user };
    case 'MEMBERS':
      return { ...state, members: reduce.members };
    default:
      return state;
  }
}

export function useYachtDiceIntent() {
  const initialState: YachtDiceState = {
    loading: false,
    user: createDummy<User>(),
    members: [],
  };
  const [state, dispatch] = useReducer(handleYachtDiceReduce, initialState);

  const navigate = useNavigate();
  const toast = useToast();

  const { user, loading: authLoading } = useAuth();
  const { loading: loungeLoading, exit,  ...lounge } = useLounge();

  const onEvent = async (event: YachtDiceEvent) => {
    switch (event.type) {
      case 'ON_CLICK_EXIT_BUTTON':
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    dispatch({ type: 'LOADING', loading: authLoading || loungeLoading });
  }, [authLoading, loungeLoading]);

  useEffect(() => {
    if (authLoading) return;

    if (user) dispatch({ type: 'USER', user });
  }, [user, authLoading]);

  useEffect(() => {
    if (loungeLoading) return;

    if (lounge && lounge.owner && lounge.members && !lounge.deletedAt) {
      dispatch({ type: 'MEMBERS', members: lounge.members });
    } else {
      toast({ title: '게임방이 존재하지 않습니다.', status: 'error', duration: 2000 });
      navigate('/main', { replace: true });
    }
  }, [lounge, loungeLoading]);
  return {
    state,
    onEvent
  };
}