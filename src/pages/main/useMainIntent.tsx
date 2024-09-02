import { useDisclosure, useToast } from '@chakra-ui/react';
import { Game, User } from 'entities';
import { createLounge, fetchAllGames, joinLounge, useAuth } from 'features';
import { useEffect, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import { createDummy, launch } from 'shared';

type MainState = {
  loading: boolean;
  user: User;
  gameList: Game[];
  selectedGame: Game | null;
};

type MainEvent =
  | { type: 'SCREEN_INITIALIZE' }
  | { type: 'ON_CLICK_LOGOUT_BUTTON' }
  | { type: 'ON_CLICK_GAME_PLAY_BUTTON'; game: Game }
  | { type: 'ON_CLICK_CREATE_LOUNGE_BUTTON' }
  | { type: 'ON_CLICK_JOIN_LOUNGE_BUTTON'; code: string };

type MainReduce =
  | { type: 'LOADING'; loading: boolean }
  | { type: 'USER'; user: User }
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
    user: createDummy<User>(),
    gameList: [],
    selectedGame: null,
  };
  const [state, dispatch] = useReducer(handleMainReduce, initialState);

  const navigate = useNavigate();
  const toast = useToast();

  const { user, logout } = useAuth();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const onCloseGameEntryModal = () => {
    dispatch({ type: 'SELECTED_GAME', selectedGame: null })
    onClose();
  };
  const modal = { isOpen, onOpen, onClose: onCloseGameEntryModal };

  const onEvent = async (event: MainEvent) => {
    switch (event.type) {
      case 'SCREEN_INITIALIZE':
        await launch(loading => dispatch({ type: 'LOADING', loading }), async () => {
          const gameList = await fetchAllGames();
          dispatch({ type: 'GAME_LIST', gameList });
        });
        break;
      case 'ON_CLICK_LOGOUT_BUTTON':
        await launch(loading => dispatch({ type: 'LOADING', loading }), async () => {
          logout();
        });
        navigate('/login', { replace: true });
        toast({ title: '로그아웃', description: '정상적으로 로그아웃되었습니다.', status: 'info', duration: 2000, isClosable: true });
        break;
      case 'ON_CLICK_GAME_PLAY_BUTTON':
        dispatch({ type: 'SELECTED_GAME', selectedGame: event.game });
        onOpen();
        break;
      case 'ON_CLICK_CREATE_LOUNGE_BUTTON':
        await launch(loading => dispatch({ type: 'LOADING', loading }), async () => {
          if (state.selectedGame && user) {
            const loungeId = await createLounge(state.selectedGame.id, user.id);
            navigate('/lounge/' + loungeId);
          }
        });
        onCloseGameEntryModal();
        break;
      case 'ON_CLICK_JOIN_LOUNGE_BUTTON':
        await launch(loading => dispatch({ type: 'LOADING', loading }), async () => {
          try {
            if (state.selectedGame && user) {
              const loungeId = await joinLounge(event.code, state.selectedGame.id, user.id);
              navigate('/lounge/' + loungeId);
            }
          } catch (error) {
            toast({ title: '실패', description: '유효하지 않은 코드거나 게임이 다릅니다.', status: 'error', duration: 2000, isClosable: true });
            throw error;
          }
        });
        onCloseGameEntryModal();
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (user) dispatch({ type: 'USER', user });
  }, [user]);

  return {
    state,
    modal,
    onEvent
  };
}