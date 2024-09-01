import { useDisclosure, useToast } from '@chakra-ui/react';
import { Game, User } from 'entities';
import { createLounge, useAuth, useFetchGameList } from 'features';
import { useEffect, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';

type MainState = {
  loading: boolean;
  user: User | null;
  gameList: Game[];
  selectedGame: Game | null;
};

type MainEvent =
  | { type: 'ON_CLICK_LOGOUT_BUTTON' }
  | { type: 'ON_CLICK_GAME_PLAY_BUTTON'; game: Game }
  | { type: 'ON_CLICK_CREATE_LOUNGE_BUTTON' }
  | { type: 'ON_CLICK_JOIN_LOUNGE_BUTTON'; code: string };

type MainReduce =
  | { type: 'LOADING'; loading: boolean }
  | { type: 'USER'; user: User | null }
  | { type: 'GAME_LIST'; gameList: Game[] }
  | { type: 'SELECTED_GAME'; selectedGame: Game | null };

function handleMainReduce(state: MainState, reduce: MainReduce): MainState {
  switch (reduce.type) {
    case 'LOADING':
      return { ...state, loading: reduce.loading };
    case 'USER':
      return { ...state, user: reduce.user };
    case 'GAME_LIST':
      return { ...state, gameList: reduce.gameList };
    case 'SELECTED_GAME':
      return { ...state, selectedGame: reduce.selectedGame };
    default:
      return state;
  }
}

export function useMainIntent() {
  const initialState: MainState = {
    loading: false,
    user: null,
    gameList: [],
    selectedGame: null,
  };
  const [state, dispatch] = useReducer(handleMainReduce, initialState);

  const navigate = useNavigate();
  const toast = useToast();

  const { user, logout } = useAuth();
  const { data: gameList } = useFetchGameList();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const onCloseGameEntryModal = () => {
    dispatch({ type: 'SELECTED_GAME', selectedGame: null })
    onClose();
  };
  const modal = { isOpen, onOpen, onClose: onCloseGameEntryModal };

  const onEvent = async (event: MainEvent) => {
    switch (event.type) {
      case 'ON_CLICK_LOGOUT_BUTTON':
        logout();

        navigate('/login', { replace: true });
        toast({ title: '로그아웃', description: '정상적으로 로그아웃되었습니다.', status: 'info', duration: 9000, isClosable: true });
        break;
      case 'ON_CLICK_GAME_PLAY_BUTTON':
        dispatch({ type: 'SELECTED_GAME', selectedGame: event.game });
        onOpen();
        break;
      case 'ON_CLICK_CREATE_LOUNGE_BUTTON':
        dispatch({ type: 'LOADING', loading: true });
        if (state.selectedGame && user) {
          const loungeId = await createLounge(state.selectedGame.id, user.id);
          navigate(`/lounge/${loungeId}`);
        }
        onCloseGameEntryModal();
        dispatch({ type: 'LOADING', loading: false });
        break;
      case 'ON_CLICK_JOIN_LOUNGE_BUTTON':
        dispatch({ type: 'LOADING', loading: true });
        onCloseGameEntryModal();
        dispatch({ type: 'LOADING', loading: false });
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (user) dispatch({ type: 'USER', user });
    if (gameList) dispatch({ type: 'GAME_LIST', gameList });
  }, [user, gameList]);

  return {
    state,
    modal,
    onEvent
  };
}