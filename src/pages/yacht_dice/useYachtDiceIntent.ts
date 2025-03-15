import { useDisclosure, useToast } from '@chakra-ui/react';
import { useAuthContext, Paths } from 'app';
import {
  exitLounge,
  exitYachtDice,
  fetchUserById,
  fetchUsersByIds,
  onYachtDiceStateChanged,
  updateYachtDiceState,
  useLoungeContext,
} from 'features';
import { useEffect, useReducer, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CommonError, CommonToast, launch } from 'shared';
import { GameName } from 'shared/string';
import * as Intent from './YatchDiceIntent';

export function useYachtDiceIntent() {
  const navigate = useNavigate();
  const toast = useToast();

  const auth = useAuthContext();
  const lounge = useLoungeContext();

  const resultModal = useDisclosure();
  const modal = {
    resultModal: {
      ...resultModal,
      onClose: () => {
        navigate(Paths.main, { replace: true });
        resultModal.onClose();
      },
    },
  };

  const [state, dispatch] = useReducer(Intent.reducer, Intent.initialState);
  const [loading, setLoading] = useState(true);

  const onEvent: Intent.event = {
    onClickExitButton: () => {
      launch(setLoading, async () => {
        await exitLounge(lounge.id, auth.id);
        await exitYachtDice(lounge.id, auth.id);
        toast(CommonToast.EXIT_LOUNGE);
        navigate(Paths.main, { replace: true });
      });
    },
    onClickPrevBoardButton: () => {
      const currentIndex = state.players.findIndex(
        (player) => player.id === state.currentBoardPlayer.id
      );
      const prevBoardPlayer =
        state.players[(currentIndex - 1 + state.players.length) % state.players.length];
      dispatch({ type: 'CURRENT_BOARD_PLAYER', currentBoardPlayer: prevBoardPlayer });
    },
    onClickNextBoardButton: () => {
      const nextIndex = state.players.findIndex(
        (player) => player.id === state.currentBoardPlayer.id
      );
      const nextBoardPlayer = state.players[(nextIndex + 1) % state.players.length];
      dispatch({ type: 'CURRENT_BOARD_PLAYER', currentBoardPlayer: nextBoardPlayer });
    },
    onClickRollButton: () => {
      if (auth.id !== state.turn.id) toast(CommonToast.NOT_MY_TURN);
      else {
        dispatch({ type: 'SAVE_KEPT' });
        dispatch({ type: 'ROLLING', rolling: true });
      }
    },
    onRollFinish: (values: number[]) => {
      dispatch({ type: 'ROLLING', rolling: false });
      updateYachtDiceState(lounge.id, { dice: values, 'rolls-decrease': 1 }).catch((error) => {
        if (error.code === CommonError.PERMISSION_DENIED) toast(CommonToast.NOT_MY_TURN);
      });
    },
    onAddDiceToKeep: (index: number) => {
      updateYachtDiceState(lounge.id, { 'keep-add': index }).catch((error) => {
        if (error.code === CommonError.PERMISSION_DENIED) toast(CommonToast.NOT_MY_TURN);
      });
    },
    onRemoveDiceToKeep: (index: number) => {
      updateYachtDiceState(lounge.id, { 'keep-remove': index }).catch((error) => {
        if (error.code === CommonError.PERMISSION_DENIED) toast(CommonToast.NOT_MY_TURN);
      });
    },
    onClickSelectHandButton: (key: string, value: number) => {
      updateYachtDiceState(lounge.id, { boards: { key, value } }).catch((error) => {
        if (error.code === CommonError.PERMISSION_DENIED) toast(CommonToast.NOT_MY_TURN);
      });
    },
  };

  useEffect(() => {
    if (lounge.loading) return;

    if (lounge.game.name !== GameName.YatchDice.korean) {
      toast(CommonToast.NO_LOUNGE);
      navigate(Paths.main, { replace: true });
      return;
    }

    const unsubscribe = onYachtDiceStateChanged(lounge.id, async (game) => {
      const players = await fetchUsersByIds(game.playerIds);
      const turn = await fetchUserById(game.turn);

      dispatch({ type: 'PLAYERS', players });
      dispatch({ type: 'ROUND', round: game.round });
      dispatch({ type: 'BOARDS', boards: game.boards });
      dispatch({ type: 'CURRENT_BOARD_PLAYER', currentBoardPlayer: players[0] });
      dispatch({ type: 'TURN', turn });
      dispatch({ type: 'DICE', dice: game.dice });
      dispatch({ type: 'KEEP', keep: game.keep ?? [] });
      dispatch({ type: 'ROLLS', rolls: game.rolls });

      if (game.rolls === 0) dispatch({ type: 'SAVE_KEPT' });
      else if (game.rolls === 3) dispatch({ type: 'CLEAR_KEPT' });

      if (game.turn === auth.id && game.rolls === 3) toast(CommonToast.MY_TURN);

      if (game.finishedAt) modal.resultModal.onOpen();

      setLoading(false);
    });

    return () => unsubscribe();
  }, [lounge.id, lounge.loading]);

  return { state, loading, modal, onEvent };
}
