import { useDisclosure } from '@chakra-ui/react';
import { useAuthContext, useLoungeContext } from 'app';
import { LoungeApi, UserApi, YachtDiceApi } from 'features';
import { YachtDiceBoard } from '../model';
import { useEffect, useReducer, useState } from 'react';
import {
  CommonError,
  CommonToast,
  GameName,
  useAsyncAction,
  useSideEffectQueue,
} from 'shared';
import * as Intent from './YachtDice.intent';

type YachtDiceAction = 'exit' | 'roll' | 'keep' | 'selectHand';

const isPermissionDenied = (error: unknown) =>
  error instanceof Error && error.message === CommonError.PERMISSION_DENIED;

export function useYachtDiceIntent() {
  const auth = useAuthContext();
  const lounge = useLoungeContext();

  const resultModal = useDisclosure();

  const modal = {
    resultModal: {
      ...resultModal,
      onClose: () => {
        setSideEffect({ type: 'POP_BACK_STACK' });
        resultModal.onClose();
      },
    },
  };

  const [state, dispatch] = useReducer(Intent.reducer, new Intent.State({}));
  const [loading, setLoading] = useState(true);
  const actions = useAsyncAction<YachtDiceAction>();

  const {
    clearSideEffects,
    pushSideEffect: setSideEffect,
    sideEffects,
  } = useSideEffectQueue<NonNullable<Intent.SideEffect>>();

  const onEvent: Intent.Event = {
    onClickExitButton: () => {
      actions.run('exit', async () => {
        setLoading(true);
        try {
          await LoungeApi.exit(lounge.id, auth.id);
          await YachtDiceApi.exit(lounge.id, auth.id);
          setSideEffect({ type: 'SHOW_TOAST', options: CommonToast.EXIT_LOUNGE });
          setSideEffect({ type: 'POP_BACK_STACK' });
        } finally {
          setLoading(false);
        }
      });
    },
    onClickPrevBoardButton: () => {
      const currentIndex = state.players.findIndex(
        (player) => player.id === state.currentBoardPlayer.id
      );
      const prevBoardPlayer =
        state.players[(currentIndex - 1 + state.players.length) % state.players.length];
      dispatch({ type: 'UPDATE_CURRENT_BOARD_PLAYER', currentBoardPlayer: prevBoardPlayer });
    },
    onClickNextBoardButton: () => {
      const nextIndex = state.players.findIndex(
        (player) => player.id === state.currentBoardPlayer.id
      );
      const nextBoardPlayer = state.players[(nextIndex + 1) % state.players.length];
      dispatch({ type: 'UPDATE_CURRENT_BOARD_PLAYER', currentBoardPlayer: nextBoardPlayer });
    },
    onClickRollButton: () => {
      if (auth.id !== state.turn.id)
        setSideEffect({ type: 'SHOW_TOAST', options: CommonToast.NOT_MY_TURN });
      else {
        dispatch({ type: 'SAVE_KEPT' });
        dispatch({ type: 'UPDATE_ROLLING', rolling: true });
      }
    },
    onRollFinish: (values: number[]) => {
      dispatch({ type: 'UPDATE_ROLLING', rolling: false });
      actions.run('roll', async () => {
        await YachtDiceApi.roll(lounge.id, auth.id, values);
      }).catch((error) => {
        if (isPermissionDenied(error))
          setSideEffect({ type: 'SHOW_TOAST', options: CommonToast.NOT_MY_TURN });
      });
    },
    onAddDiceToKeep: (index: number) => {
      actions.run('keep', async () => {
        await YachtDiceApi.addKeep(lounge.id, auth.id, index);
      }).catch((error) => {
        if (isPermissionDenied(error))
          setSideEffect({ type: 'SHOW_TOAST', options: CommonToast.NOT_MY_TURN });
      });
    },
    onRemoveDiceToKeep: (index: number) => {
      actions.run('keep', async () => {
        await YachtDiceApi.removeKeep(lounge.id, auth.id, state.keep[index]);
      }).catch((error) => {
        if (isPermissionDenied(error))
          setSideEffect({ type: 'SHOW_TOAST', options: CommonToast.NOT_MY_TURN });
      });
    },
    onClickSelectHandButton: (key: keyof YachtDiceBoard, value: number) => {
      actions.run('selectHand', async () => {
        await YachtDiceApi.updateBoards(lounge.id, auth.id, key, value);
      }).catch((error) => {
        if (isPermissionDenied(error))
          setSideEffect({ type: 'SHOW_TOAST', options: CommonToast.NOT_MY_TURN });
      });
    },
  };

  useEffect(() => {
    if (lounge.loading) return;

    if (lounge.game.name !== GameName.YatchDice.korean) {
      setSideEffect({ type: 'SHOW_TOAST', options: CommonToast.NO_LOUNGE });
      setSideEffect({ type: 'POP_BACK_STACK' });
      return;
    }

    const unsubscribe = YachtDiceApi.onStateChanged(lounge.id, async (game) => {
      const [players, turn] = await Promise.all([
        Promise.all(game.playerIds.map(UserApi.fetchById)),
        UserApi.fetchById(game.turn),
      ]);

      dispatch({ type: 'UPDATE_PLAYERS', players });
      dispatch({ type: 'UPDATE_ROUND', round: game.round });
      dispatch({ type: 'UPDATE_BOARDS', boards: game.boards });
      dispatch({ type: 'UPDATE_CURRENT_BOARD_PLAYER', currentBoardPlayer: players[0] });
      dispatch({ type: 'UPDATE_TURN', turn });
      dispatch({ type: 'UPDATE_DICE', dice: game.dice });
      dispatch({ type: 'UPDATE_KEEP', keep: game.keep ?? [] });
      dispatch({ type: 'UPDATE_ROLLS', rolls: game.rolls });

      if (game.rolls === 0) dispatch({ type: 'SAVE_KEPT' });
      else if (game.rolls === 3) dispatch({ type: 'CLEAR_KEPT' });

      if (game.turn === auth.id && game.rolls === 3)
        setSideEffect({ type: 'SHOW_TOAST', options: CommonToast.NOT_MY_TURN });

      if (game.finishedAt) modal.resultModal.onOpen();

      setLoading(false);
    });

    return () => unsubscribe();
  }, [lounge.id, lounge.loading]);

  return { state, loading, clearSideEffects, modal, onEvent, sideEffects };
}
