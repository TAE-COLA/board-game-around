import { useDisclosure, useToast } from '@chakra-ui/react';
import { Paths } from 'app';
import {
  drawDavinciCodeTile,
  exitDavinciCode,
  exitLounge,
  fetchUserById,
  fetchUsersByIds,
  onDavinciCodeStateChanged,
  updateDavinciCodeHand,
  useAuthContext,
  useLoungeContext,
} from 'features';
import { useEffect, useReducer, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CommonToast, launch } from 'shared';
import { GameName } from 'shared/string';
import * as Intent from './DavinciCodeIntent';

export const useDavinciCodeIntent = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const auth = useAuthContext();
  const lounge = useLoungeContext();

  const resultModal = useDisclosure();
  const drawModal = useDisclosure();
  const numberModal = useDisclosure();

  const [state, dispatch] = useReducer(Intent.reducer, Intent.initialState);
  const [loading, setLoading] = useState(true);

  const modal = {
    resultModal: {
      isOpen: resultModal.isOpen,
      onOpen: resultModal.onOpen,
      onClose() {
        navigate(Paths.main, { replace: true });
        resultModal.onClose();
      },
    },
    drawModal: {
      isOpen: drawModal.isOpen,
      onOpen: drawModal.onOpen,
      onClose() {
        dispatch({ type: 'DRAWABLE_TILES', drawableTiles: 0 });
        drawModal.onClose();
      },
    },
    numberModal: {
      isOpen: numberModal.isOpen,
      onOpen: numberModal.onOpen,
      onClose: numberModal.onClose,
    },
  };

  const onEvent: Intent.event = {
    onClickExitButton: () => {
      launch(setLoading, async () => {
        await exitLounge(lounge.id, auth.id);
        await exitDavinciCode(lounge.id, auth.id);
        toast(CommonToast.EXIT_LOUNGE);
        navigate(Paths.main, { replace: true });
      });
    },
    onClickDrawButton: (isWhite) => {
      drawDavinciCodeTile(lounge.id, isWhite);
    },
    onSubmitHand: (hand) => {
      updateDavinciCodeHand(lounge.id, auth.id, hand, true);
    },
    onClickTile: () => {
      modal.numberModal.onOpen();
    },
  };

  useEffect(() => {
    if (lounge.loading) return;

    if (lounge.game.name !== GameName.DavinciCode.korean) {
      toast(CommonToast.NO_LOUNGE);
      navigate(Paths.main, { replace: true });
      return;
    }

    const unsubscribe = onDavinciCodeStateChanged(lounge.id, async (game) => {
      const players = await fetchUsersByIds(game.playerIds);
      const turn = await fetchUserById(game.turn);
      const finishedPlayers = await fetchUsersByIds(game.finishedPlayerIds);

      dispatch({ type: 'PLAYERS', players });
      dispatch({ type: 'HANDS', hands: game.hands });
      dispatch({ type: 'TURN', turn });
      dispatch({ type: 'PHASE', phase: game.phase });
      dispatch({ type: 'FINISHED_PLAYERS', finishedPlayers });

      if (game.turn === auth.id && game.phase !== 'GUESS') {
        dispatch({ type: 'PENDING_TILES', pendingTiles: game.pendingTiles });

        if (game.phase === 'INITIAL_DRAW') dispatch({ type: 'DRAWABLE_TILES', drawableTiles: 4 });
        else if (game.phase === 'DRAW') dispatch({ type: 'DRAWABLE_TILES', drawableTiles: 1 });

        modal.drawModal.onOpen();
      }

      if (game.finishedAt) modal.resultModal.onOpen();

      setLoading(false);
    });

    return () => unsubscribe();
  }, [lounge.id, lounge.loading]);

  return { state, loading, modal, onEvent };
};
