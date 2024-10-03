import { useDisclosure, useToast } from '@chakra-ui/react';
import { Game } from 'entities';
import { createLounge, fetchAllGames, joinLounge, useAuthContext } from 'features';
import { getAuth, signOut } from 'firebase/auth';
import { useEffect, useReducer, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { launch } from 'shared';

type MainState = {
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
  | { type: 'GAME_LIST'; gameList: Game[] }
  | { type: 'SELECTED_GAME'; selectedGame: Game | null };

function handleMainReduce(state: MainState, reduce: MainReduce): MainState {
  switch (reduce.type) {
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
    gameList: [],
    selectedGame: null,
  };
  const [state, dispatch] = useReducer(handleMainReduce, initialState);
  const [loading, setLoading] = useState(true);

  const auth = useAuthContext();

  const navigate = useNavigate();
  const toast = useToast();
  const firebaseAuth = getAuth();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const onCloseGameEntryModal = () => {
    dispatch({ type: 'SELECTED_GAME', selectedGame: null })
    onClose();
  };
  const modal = { isOpen, onOpen, onClose: onCloseGameEntryModal };

  const onEvent = async (event: MainEvent) => {
    switch (event.type) {
      case 'SCREEN_INITIALIZE':
        await launch(setLoading, async () => {
          const gameList = await fetchAllGames();
          dispatch({ type: 'GAME_LIST', gameList });
        });
        break;
      case 'ON_CLICK_LOGOUT_BUTTON':
        await launch(setLoading, async () => {
          await signOut(firebaseAuth);
          navigate('/login', { replace: true });
          toast({ title: '로그아웃되었습니다.', duration: 2000 });
        });
        break;
      case 'ON_CLICK_GAME_PLAY_BUTTON':
        dispatch({ type: 'SELECTED_GAME', selectedGame: event.game });
        onOpen();
        break;
      case 'ON_CLICK_CREATE_LOUNGE_BUTTON':
        await launch(setLoading, async () => {
          if (state.selectedGame) {
            await createLounge(state.selectedGame.id, auth.id);
            navigate('/lounge');
          }
        });
        onCloseGameEntryModal();
        break;
      case 'ON_CLICK_JOIN_LOUNGE_BUTTON':
        await launch(setLoading, async () => {
          try {
            if (state.selectedGame) {
              await joinLounge(event.code, state.selectedGame.id, auth.id);
              navigate('/lounge');
            }
          } catch (error) {
            toast({ title: '유효하지 않은 코드거나 게임이 다릅니다.', status: 'error', duration: 2000 });
          }
        });
        onCloseGameEntryModal();
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    setLoading(loading || auth.loading);
  }, [auth.loading]);

  useEffect(() => {
    onEvent({ type: 'SCREEN_INITIALIZE' });
  }, []);

  return {
    state,
    loading,
    modal,
    onEvent
  };
}