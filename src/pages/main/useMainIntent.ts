import { useDisclosure, useToast } from '@chakra-ui/react';
import { Paths } from 'app';
import { createLounge, fetchAllGames, joinLounge, useAuthContext } from 'features';
import { getAuth, signOut } from 'firebase/auth';
import { useEffect, useReducer, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CommonToast, launch } from 'shared';
import * as Intent from './MainIntent';

export function useMainIntent() {
  const auth = useAuthContext();

  const navigate = useNavigate();
  const toast = useToast();
  const firebaseAuth = getAuth();

  const gameEntryModal = useDisclosure();
  const modal = {
    gameEntryModal: {
      isOpen: gameEntryModal.isOpen,
      onOpen: gameEntryModal.onOpen,
      onClose() {
        dispatch({ type: 'SELECTED_GAME', selectedGame: null });
        gameEntryModal.onClose();
      },
    },
  };

  const [state, dispatch] = useReducer(Intent.reducer, Intent.initialState);
  const [loading, setLoading] = useState(true);

  const onEvent = async (event: Intent.event) => {
    switch (event.type) {
      case 'ON_CLICK_LOGOUT_BUTTON':
        await launch(setLoading, async () => {
          await signOut(firebaseAuth);
          navigate(Paths.login, { replace: true });
          toast(CommonToast.LOGOUT_SUCCESS);
        });
        break;
      case 'ON_CLICK_GAME_PLAY_BUTTON':
        dispatch({ type: 'SELECTED_GAME', selectedGame: event.game });
        modal.gameEntryModal.onOpen();
        break;
      case 'ON_CLICK_CREATE_LOUNGE_BUTTON':
        await launch(setLoading, async () => {
          if (state.selectedGame) {
            await createLounge(state.selectedGame.id, auth.id);
            navigate(Paths.lounge);
          }
        });
        modal.gameEntryModal.onClose();
        break;
      case 'ON_CLICK_JOIN_LOUNGE_BUTTON':
        await launch(setLoading, async () => {
          try {
            if (state.selectedGame) {
              await joinLounge(event.code, state.selectedGame.id, auth.id);
              navigate(Paths.lounge);
            }
          } catch {
            toast(CommonToast.INVALID_GAME_ID);
          }
        });
        modal.gameEntryModal.onClose();
        break;
    }
  };

  useEffect(() => {
    setLoading((prevLoding) => prevLoding || auth.loading);
  }, [auth.loading]);

  useEffect(() => {
    launch(setLoading, async () => {
      const gameList = await fetchAllGames();
      dispatch({ type: 'GAME_LIST', gameList });
    });
  }, []);

  return { state, loading, modal, onEvent };
}
