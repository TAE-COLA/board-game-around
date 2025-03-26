import { useDisclosure } from '@chakra-ui/react';
import { useAuthContext, useLoungeContext } from 'app';
import { DavinciCodeApi, LoungeApi, UserApi } from 'features';
import { DavinciCodePhase } from 'models';
import { useEffect, useReducer, useState } from 'react';
import { CommonToast, GameName, launch } from 'shared';
import {
  createState,
  Event,
  reducer,
  Reduces,
  SideEffect,
  SideEffects,
} from './DavinciCode.intent';

export const useDavinciCodeIntent = () => {
  const auth = useAuthContext();
  const lounge = useLoungeContext();

  const [state, dispatch] = useReducer(reducer, createState());
  const [loading, setLoading] = useState(true);

  const [sideEffect, setSideEffect] = useState<SideEffect>();

  const resultModal = useDisclosure();
  const drawModal = useDisclosure();
  const numberModal = useDisclosure();

  const modal = {
    resultModal: {
      ...resultModal,
      onClose() {
        setSideEffect({ type: SideEffects.NAVIGATE_TO_MAIN });
        resultModal.onClose();
      },
    },
    drawModal: {
      ...drawModal,
      onClose() {
        dispatch({ type: Reduces.UPDATE_DRAWABLE_TILES, drawableTiles: 0 });
        drawModal.onClose();
      },
    },
    numberModal,
  };

  const onEvent: Event = {
    onClickExitButton: () => {
      launch(setLoading, async () => {
        await LoungeApi.exit(lounge.id, auth.id);
        await DavinciCodeApi.exit(lounge.id, auth.id);
        setSideEffect({ type: SideEffects.SHOW_TOAST, options: CommonToast.EXIT_LOUNGE });
        setSideEffect({ type: SideEffects.NAVIGATE_TO_MAIN });
      });
    },
    onClickDrawButton: (isWhite) => {
      DavinciCodeApi.drawTile(lounge.id, isWhite);
    },
    onSubmitHand: (hand) => {
      DavinciCodeApi.updateHand(lounge.id, auth.id, hand, true);
    },
    onClickTile: () => {
      modal.numberModal.onOpen();
    },
  };

  useEffect(() => {
    if (lounge.loading) return;

    if (lounge.game.name !== GameName.DavinciCode.korean) {
      setSideEffect({ type: SideEffects.SHOW_TOAST, options: CommonToast.NO_LOUNGE });
      setSideEffect({ type: SideEffects.NAVIGATE_TO_MAIN });
      return;
    }

    const unsubscribe = DavinciCodeApi.onStateChanged(lounge.id, async (game) => {
      const [players, turn, finishedPlayers] = await Promise.all([
        Promise.all(game.playerIds.map(UserApi.fetchById)),
        UserApi.fetchById(game.turn),
        Promise.all(game.finishedPlayerIds.map(UserApi.fetchById)),
      ]);

      dispatch({ type: Reduces.UPDATE_PLAYERS, players });
      dispatch({ type: Reduces.UPDATE_HANDS, hands: game.hands });
      dispatch({ type: Reduces.UPDATE_TURN, turn });
      dispatch({ type: Reduces.UPDATE_PHASE, phase: game.phase });
      dispatch({ type: Reduces.UPDATE_FINISHED_PLAYERS, finishedPlayers });

      if (game.turn === auth.id && game.phase !== DavinciCodePhase.GUESS) {
        dispatch({ type: Reduces.UPDATE_PENDING_TILES, pendingTiles: game.pendingTiles });

        if (game.phase === DavinciCodePhase.INITIAL_DRAW)
          dispatch({ type: Reduces.UPDATE_DRAWABLE_TILES, drawableTiles: 4 });
        else if (game.phase === DavinciCodePhase.DRAW)
          dispatch({ type: Reduces.UPDATE_DRAWABLE_TILES, drawableTiles: 1 });

        modal.drawModal.onOpen();
      }

      if (game.finishedAt) modal.resultModal.onOpen();

      setLoading(false);
    });

    return () => unsubscribe();
  }, [lounge.id, lounge.loading]);

  return { state, loading, modal, onEvent, sideEffect };
};
