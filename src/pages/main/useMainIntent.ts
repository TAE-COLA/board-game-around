import { useDisclosure, useToast } from '@chakra-ui/react';
import { Paths, useAuthContext } from 'app';
import { createLounge, fetchAllGames, joinLounge } from 'features';
import { getAuth, signOut } from 'firebase/auth';
import { useEffect, useReducer, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CommonToast, launch } from 'shared';
import * as Intent from './MainIntent';

export const useMainIntent = () => {
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

  const onEvent: Intent.event = {
    onClickLogoutButton: () => {
      launch(setLoading, async () => {
        await signOut(firebaseAuth);
        navigate(Paths.login, { replace: true });
        toast(CommonToast.LOGOUT_SUCCESS);
      });
    },
    onClickGamePlayButton: (game) => {
      dispatch({ type: 'SELECTED_GAME', selectedGame: game });
      modal.gameEntryModal.onOpen();
    },
    onClickCreateLoungeButton: () => {
      launch(setLoading, async () => {
        if (state.selectedGame) {
          await createLounge(state.selectedGame.id, auth.id);
          navigate(Paths.lounge);
        }

        modal.gameEntryModal.onClose();
      });
    },
    onClickJoinLoungeButton: (code) => {
      launch(setLoading, async () => {
        try {
          if (state.selectedGame) {
            await joinLounge(code, state.selectedGame.id, auth.id);
            navigate(Paths.lounge);
          }
        } catch {
          toast(CommonToast.INVALID_GAME_ID);
        }

        modal.gameEntryModal.onClose();
      });
    },
  };

  useEffect(() => {
    setLoading((prevLoading) => prevLoading || auth.loading);
  }, [auth.loading]);

  useEffect(() => {
    launch(setLoading, async () => {
      const gameList = await fetchAllGames();
      dispatch({ type: 'GAME_LIST', gameList });
    });
  }, []);

  return { state, loading, modal, onEvent };
};
