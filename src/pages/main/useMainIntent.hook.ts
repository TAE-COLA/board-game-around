import { useDisclosure } from '@chakra-ui/react';
import { useAuthContext } from 'app';
import { GameApi, LoungeApi, UserApi } from 'features';
import { useEffect, useReducer, useState } from 'react';
import { CommonToast, launch } from 'shared';
import { createState, Event, reducer, Reduces, SideEffect, SideEffects } from './Main.intent';

export const useMainIntent = () => {
  const auth = useAuthContext();

  const [state, dispatch] = useReducer(reducer, createState());
  const [loading, setLoading] = useState(true);

  const [sideEffect, setSideEffect] = useState<SideEffect>();

  const gameEntryModal = useDisclosure();

  const modal = {
    gameEntryModal: {
      ...gameEntryModal,
      onClose() {
        dispatch({ type: Reduces.UPDATE_SELECTED_GAME, selectedGame: undefined });
        gameEntryModal.onClose();
      },
    },
  };

  const onEvent: Event = {
    onClickLogoutButton: () => {
      launch(setLoading, async () => {
        await UserApi.logout();
        setSideEffect({ type: SideEffects.SHOW_TOAST, options: CommonToast.LOGOUT_SUCCESS });
        setSideEffect({ type: SideEffects.NAVIGATE_TO_LOGIN });
      });
    },
    onClickGamePlayButton: (game) => {
      dispatch({ type: Reduces.UPDATE_SELECTED_GAME, selectedGame: game });
      modal.gameEntryModal.onOpen();
    },
    onClickCreateLoungeButton: () => {
      launch(setLoading, async () => {
        modal.gameEntryModal.onClose();
        if (state.selectedGame) {
          await LoungeApi.create(state.selectedGame.id, auth.id);
          setSideEffect({ type: SideEffects.NAVIGATE_TO_LOUNGE });
        }
      });
    },
    onClickJoinLoungeButton: (code) => {
      launch(setLoading, async () => {
        modal.gameEntryModal.onClose();
        try {
          if (state.selectedGame) {
            await LoungeApi.join(code, state.selectedGame.id, auth.id);
            setSideEffect({ type: SideEffects.NAVIGATE_TO_LOUNGE });
          }
        } catch {
          setSideEffect({ type: SideEffects.SHOW_TOAST, options: CommonToast.INVALID_GAME_ID });
        }
      });
    },
  };

  useEffect(() => {
    setLoading((prevLoading) => prevLoading || auth.loading);
  }, [auth.loading]);

  useEffect(() => {
    launch(setLoading, async () => {
      const gameList = await GameApi.fetchAll();
      dispatch({ type: Reduces.UPDATE_GAME_LIST, gameList });
    });
  }, []);

  return { state, loading, modal, onEvent, sideEffect };
};
