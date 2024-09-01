import { useToast } from '@chakra-ui/react';
import { Game, User } from 'entities';
import { useAuth, useFetchGameList } from 'features';
import { useEffect, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';

type MainState = {
  loading: boolean;
  user: User | null;
  gameList: Game[];
};

type MainEvent =
  | { type: 'ON_CLICK_LOGOUT_BUTTON' }
  | { type: 'ON_CLICK_GAME_PLAY_BUTTON'; game: Game };

type MainReduce =
  | { type: 'LOADING'; loading: boolean }
  | { type: 'USER'; user: User | null }
  | { type: 'GAMES'; gameList: Game[] };

function handleMainReduce(state: MainState, reduce: MainReduce): MainState {
  switch (reduce.type) {
    case 'LOADING':
      return { ...state, loading: reduce.loading };
    case 'USER':
      return { ...state, user: reduce.user };
    case 'GAMES':
      return { ...state, gameList: reduce.gameList };
    default:
      return state;
  }
}

export function useMainIntent() {
  const initialState: MainState = {
    loading: false,
    user: null,
    gameList: [],
  };
  const [state, dispatch] = useReducer(handleMainReduce, initialState);

  const navigate = useNavigate();
  const toast = useToast();

  const { user, logout } = useAuth();
  const { data: gameList } = useFetchGameList();

  const onEvent = async (event: MainEvent) => {
    switch (event.type) {
      case 'ON_CLICK_LOGOUT_BUTTON':
        logout();

        navigate('/login', { replace: true });
        toast({ title: '로그아웃', description: '정상적으로 로그아웃되었습니다.', status: 'info', duration: 9000, isClosable: true });
        break;
      case 'ON_CLICK_GAME_PLAY_BUTTON':
        // TODO: 게임 실행 페이지로 이동
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (user) dispatch({ type: 'USER', user });
    if (gameList) dispatch({ type: 'GAMES', gameList });
  }, [user, gameList]);

  return {
    state,
    onEvent,
  };
}