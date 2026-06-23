import { useDisclosure } from '@chakra-ui/react';
import { useAuthContext, useLoungeContext } from 'app';
import { DavinciCodeApi, LoungeApi, UserApi } from 'features';
import { useEffect, useReducer, useState } from 'react';
import { CommonToast, GameName, useAsyncAction, useSideEffectQueue } from 'shared';
import * as Intent from './DavinciCode.intent';

type DavinciCodeAction = 'exit' | 'draw' | 'submitHand';

export const useDavinciCodeIntent = () => {
  const auth = useAuthContext();
  const lounge = useLoungeContext();

  const [state, dispatch] = useReducer(Intent.reducer, new Intent.State({}));
  const [loading, setLoading] = useState(true);
  const actions = useAsyncAction<DavinciCodeAction>();

  const {
    clearSideEffects,
    pushSideEffect: setSideEffect,
    sideEffects,
  } = useSideEffectQueue<NonNullable<Intent.SideEffect>>();

  const resultModal = useDisclosure();
  const drawModal = useDisclosure();
  const numberModal = useDisclosure();

  const modal = {
    resultModal: {
      ...resultModal,
      onClose() {
        setSideEffect({ type: 'NAVIGATE_TO_MAIN' });
        resultModal.onClose();
      },
    },
    drawModal: {
      ...drawModal,
      onClose() {
        dispatch({ type: 'UPDATE_DRAWABLE_TILES', drawableTiles: 0 });
        drawModal.onClose();
      },
    },
    numberModal,
  };

  const onEvent: Intent.Event = {
    onClickExitButton: () => {
      actions.run('exit', async () => {
        setLoading(true);
        try {
          await LoungeApi.exit(lounge.id, auth.id);
          await DavinciCodeApi.exit(lounge.id, auth.id);
          setSideEffect({ type: 'SHOW_TOAST', options: CommonToast.EXIT_LOUNGE });
          setSideEffect({ type: 'NAVIGATE_TO_MAIN' });
        } finally {
          setLoading(false);
        }
      });
    },
    onClickDrawButton: (isWhite) => {
      actions.run('draw', async () => {
        await DavinciCodeApi.drawTile(lounge.id, auth.id, isWhite);
      });
    },
    onSubmitHand: (hand) => {
      actions.run('submitHand', async () => {
        await DavinciCodeApi.updateHand(lounge.id, auth.id, hand, true);
      });
    },
    onClickTile: () => {
      modal.numberModal.onOpen();
    },
  };

  useEffect(() => {
    if (lounge.loading) return;

    if (lounge.game.name !== GameName.DavinciCode.korean) {
      setSideEffect({ type: 'SHOW_TOAST', options: CommonToast.NO_LOUNGE });
      setSideEffect({ type: 'NAVIGATE_TO_MAIN' });
      return;
    }

    const unsubscribe = DavinciCodeApi.onStateChanged(lounge.id, async (game) => {
      const [players, turn, finishedPlayers] = await Promise.all([
        Promise.all(game.playerIds.map(UserApi.fetchById)),
        UserApi.fetchById(game.turn),
        Promise.all(game.finishedPlayerIds.map(UserApi.fetchById)),
      ]);

      dispatch({ type: 'UPDATE_PLAYERS', players });
      dispatch({ type: 'UPDATE_HANDS', hands: game.hands });
      dispatch({ type: 'UPDATE_TURN', turn });
      dispatch({ type: 'UPDATE_PHASE', phase: game.phase });
      dispatch({ type: 'UPDATE_FINISHED_PLAYERS', finishedPlayers });

      if (game.turn === auth.id && game.phase !== 'GUESS') {
        dispatch({ type: 'UPDATE_PENDING_TILES', pendingTiles: game.pendingTiles });

        if (game.phase === 'INITIAL_DRAW')
          dispatch({ type: 'UPDATE_DRAWABLE_TILES', drawableTiles: 4 });
        else if (game.phase === 'DRAW')
          dispatch({ type: 'UPDATE_DRAWABLE_TILES', drawableTiles: 1 });

        modal.drawModal.onOpen();
      }

      if (game.finishedAt) modal.resultModal.onOpen();

      setLoading(false);
    });

    return () => unsubscribe();
  }, [lounge.id, lounge.loading]);

  return { state, loading, clearSideEffects, modal, onEvent, sideEffects };
};
