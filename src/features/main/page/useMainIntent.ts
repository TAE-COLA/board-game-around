import { useDisclosure } from '@chakra-ui/react';
import { useAuthContext } from 'app';
import { GameApi, LoungeApi, UserApi } from 'features';
import { useEffect, useReducer, useState } from 'react';
import { CommonToast, launch } from 'shared';
import * as Intent from './Main.intent';

export const useMainIntent = () => {
  const auth = useAuthContext();

  const [state, dispatch] = useReducer(Intent.reducer, new Intent.State({}));
  const [loading, setLoading] = useState(true);

  const [sideEffect, setSideEffect] = useState<Intent.SideEffect>();

  const gameEntryModal = useDisclosure();

  const modal = {
    gameEntryModal: {
      ...gameEntryModal,
      onClose() {
        dispatch({ type: 'UPDATE_SELECTED_GAME', selectedGame: null });
        gameEntryModal.onClose();
      },
    },
  };

  const onEvent: Intent.Event = {
    onClickLogoutButton: () => {
      launch(setLoading, async () => {
        await UserApi.logout();
        setSideEffect({ type: 'SHOW_TOAST', options: CommonToast.LOGOUT_SUCCESS });
        setSideEffect({ type: 'NAVIGATE_TO_LOGIN' });
      });
    },
    onClickGamePlayButton: (game) => {
      dispatch({ type: 'UPDATE_SELECTED_GAME', selectedGame: game });
      modal.gameEntryModal.onOpen();
    },
    onClickCreateLoungeButton: () => {
      launch(setLoading, async () => {
        if (state.selectedGame) {
          await LoungeApi.create(state.selectedGame.id, auth.id);
          setSideEffect({ type: 'NAVIGATE_TO_LOUNGE' });
        }
        modal.gameEntryModal.onClose();
      });
    },
    onClickJoinLoungeButton: (code) => {
      launch(setLoading, async () => {
        try {
          if (state.selectedGame) {
            await LoungeApi.join(code.trim(), state.selectedGame.id, auth.id);
            setSideEffect({ type: 'NAVIGATE_TO_LOUNGE' });
          }
        } catch {
          setSideEffect({ type: 'SHOW_TOAST', options: CommonToast.INVALID_GAME_ID });
        }
        modal.gameEntryModal.onClose();
      });
    },
  };

  useEffect(() => {
    if (auth.loading) {
      setLoading(true);
      return;
    }

    launch(setLoading, async () => {
      const gameList = await GameApi.fetchAll();
      dispatch({ type: 'UPDATE_GAME_LIST', gameList });
    });
  }, [auth.loading]);

  return { state, loading, modal, onEvent, sideEffect };
};
