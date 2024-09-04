import { useToast } from '@chakra-ui/react';
import { Lounge, User } from 'entities';
import { fetchLoungeById, fetchUsersByIds, useAuth } from 'features';
import { useEffect, useReducer } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createDummy } from 'shared';

type YachtDiceState = {
  loading: boolean;
  user: User;
  lounge: Lounge;
    members: User[];
};

type YachtDiceEvent =
  | { type: 'SCREEN_INITIALIZE' }
  | { type: 'ON_CLICK_EXIT_BUTTON'; email: string };

type YachtDiceReduce =
  | { type: 'LOADING'; loading: boolean }
  | { type: 'USER'; user: User }
  | { type: 'LOUNGE'; lounge: Lounge }
  | { type: 'MEMBERS'; members: User[] };

function handleYachtDiceReduce(state: YachtDiceState, reduce: YachtDiceReduce): YachtDiceState {
  switch (reduce.type) {
    case 'LOADING':
      return { ...state, loading: reduce.loading };
    case 'USER':
      return { ...state, user: reduce.user };
    case 'LOUNGE':
      return { ...state, lounge: reduce.lounge };
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
    lounge: createDummy<Lounge>(),
    members: [],
  };
  const [state, dispatch] = useReducer(handleYachtDiceReduce, initialState);

  const navigate = useNavigate();
  const toast = useToast();

  const { user } = useAuth();
  const { loungeId } = useParams();

  const onEvent = async (event: YachtDiceEvent) => {
    switch (event.type) {
      case 'SCREEN_INITIALIZE':
        dispatch({ type: 'LOADING', loading: true });
        fetchLoungeById(loungeId!, async (lounge) => {
          dispatch({ type: 'LOUNGE', lounge });

          if (lounge.memberIds) {
            const members = await fetchUsersByIds(lounge.memberIds!);
            dispatch({ type: 'MEMBERS', members });
          }
          dispatch({ type: 'LOADING', loading: false });
        }, () => {
          toast({ title: '게임방이 존재하지 않습니다.', status: 'error', duration: 2000 });
          navigate('/main', { replace: true });
        });
        break;
      case 'ON_CLICK_EXIT_BUTTON':
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (user) dispatch({ type: 'USER', user });
  }, [user]);

  useEffect(() => {
    onEvent({ type: 'SCREEN_INITIALIZE' });
  }, []);

  return {
    state,
    onEvent
  };
}