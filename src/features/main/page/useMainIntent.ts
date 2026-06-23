import { useDisclosure } from '@chakra-ui/react';
import { useAuthContext } from 'app';
import { GameApi, LoungeApi, UserApi } from 'features';
import { useEffect, useReducer, useState } from 'react';
import { CommonToast, useAsyncAction, useSideEffectQueue } from 'shared';
import * as Intent from './Main.intent';

type MainAction = 'fetchGames' | 'logout' | 'createLounge' | 'joinLounge';

export const useMainIntent = () => {
  const auth = useAuthContext();

  const [state, dispatch] = useReducer(Intent.reducer, new Intent.State({}));
  const [initialLoading, setInitialLoading] = useState(true);
  const actions = useAsyncAction<MainAction>();

  const {
    clearSideEffects,
    pushSideEffect: setSideEffect,
    sideEffects,
  } = useSideEffectQueue<NonNullable<Intent.SideEffect>>();

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
      actions.run('logout', async () => {
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
      actions.run('createLounge', async () => {
        if (state.selectedGame) {
          await LoungeApi.create(state.selectedGame.id, auth.id);
          setSideEffect({ type: 'NAVIGATE_TO_LOUNGE' });
        }
        modal.gameEntryModal.onClose();
      });
    },
    onClickJoinLoungeButton: (code) => {
      actions.run('joinLounge', async () => {
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
      setInitialLoading(true);
      return;
    }

    actions.run('fetchGames', async () => {
      setInitialLoading(true);
      const gameList = await GameApi.fetchAll();
      dispatch({ type: 'UPDATE_GAME_LIST', gameList });
      setInitialLoading(false);
    }).catch(() => {
      setInitialLoading(false);
    });
  }, [auth.loading]);

  return {
    state,
    loading: auth.loading || initialLoading,
    actionPending: actions.pending,
    modal,
    onEvent,
    clearSideEffects,
    sideEffects,
  };
};
