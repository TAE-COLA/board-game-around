import { useDisclosure, useToast } from '@chakra-ui/react';
import { User, YachtDiceBoard } from 'entities';
import { exitLounge, exitYachtDice, fetchUserById, fetchUsersByIds, onYachtDiceStateChanged, updateYachtDiceState, useAuthContext, useLoungeContext } from 'features';
import { useEffect, useReducer, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createDummy, launch } from 'shared';

type YachtDiceState = {
  players: User[];
  round: number;
  boards: {
    [key: string]: YachtDiceBoard;
  };
  currentBoardId: string;
  turn: User;
  dice: number[];
  kept: number[];
  keep: number[];
  rolls: number;
  rolling: boolean;
};

type YachtDiceEvent =
  | { type: 'ON_CLICK_EXIT_BUTTON' }
  | { type: 'ON_CLICK_PREV_BOARD_BUTTON' }
  | { type: 'ON_CLICK_NEXT_BOARD_BUTTON' }
  | { type: 'ON_CLICK_ROLL_BUTTON' }
  | { type: 'ON_ROLL_FINISH'; values: number[] }
  | { type: 'ON_ADD_DICE_TO_KEEP'; index: number }
  | { type: 'ON_REMOVE_DICE_TO_KEEP'; index: number }
  | { type: 'ON_CLICK_SELECT_HAND_BUTTON'; key: string; value: number };

type YachtDiceReduce =
  | { type: 'PLAYERS'; players: User[] }
  | { type: 'ROUND'; round: number }
  | { type: 'BOARDS'; boards: { [key: string]: YachtDiceBoard } }
  | { type: 'CURRENT_BOARD_ID'; currentBoardId: string }
  | { type: 'TURN'; turn: User }
  | { type: 'DICE'; dice: number[] }
  | { type: 'SAVE_KEPT' }
  | { type: 'CLEAR_KEPT' }
  | { type: 'KEEP'; keep: number[] }
  | { type: 'ADD_KEEP'; index: number }
  | { type: 'REMOVE_KEEP'; index: number }
  | { type: 'ROLLS'; rolls: number }
  | { type: 'ROLLING'; rolling: boolean };

function handleYachtDiceReduce(state: YachtDiceState, reduce: YachtDiceReduce): YachtDiceState {
  switch (reduce.type) {
    case 'PLAYERS':
      return { ...state, players: reduce.players };
    case 'ROUND':
      return { ...state, round: reduce.round };
    case 'BOARDS':
      return { ...state, boards: reduce.boards };
    case 'CURRENT_BOARD_ID':
      return { ...state, currentBoardId: reduce.currentBoardId };
    case 'TURN':
      return { ...state, turn: reduce.turn };
    case 'DICE':
      return { ...state, dice: reduce.dice };
    case 'SAVE_KEPT':
      return { ...state, kept: state.keep };
    case 'CLEAR_KEPT':
      return { ...state, kept: [] };
    case 'KEEP':
      return { ...state, keep: reduce.keep };
    case 'ADD_KEEP':
      return { ...state, keep: [...state.keep, reduce.index] };
    case 'REMOVE_KEEP':
      return { ...state, keep: state.keep.filter((index) => index !== reduce.index) };
    case 'ROLLS':
      return { ...state, rolls: reduce.rolls };
    case 'ROLLING':
      return { ...state, rolling: reduce.rolling };
    default:
      return state;
  }
}

export function useYachtDiceIntent() {
  const initialState: YachtDiceState = {
    players: [],
    round: 0,
    boards: {},
    currentBoardId: '',
    turn: createDummy<User>(),
    dice: [0, 0, 0, 0, 0],
    kept: [],
    keep: [],
    rolls: 0,
    rolling: false
  };
  const [state, dispatch] = useReducer(handleYachtDiceReduce, initialState);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const toast = useToast();

  const auth = useAuthContext();
  const lounge = useLoungeContext();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const onCloseResultModal = () => {
    navigate('/main', { replace: true });
    onClose();
  };
  const modal = { isOpen, onOpen, onClose: onCloseResultModal };

  const notMyTurnToast = () => toast({ title: '내 차례가 아닙니다.', status: 'error', duration: 2000 });

  const onEvent = async (event: YachtDiceEvent) => {
    switch (event.type) {
      case 'ON_CLICK_EXIT_BUTTON':
        await launch(setLoading, async () => {
          await exitLounge(lounge.id, auth.id);
          await exitYachtDice(lounge.id, auth.id);
          toast({ title: '게임방을 나왔습니다.', duration: 2000 });
          navigate('/main', { replace: true });
        });
        break;
      case 'ON_CLICK_PREV_BOARD_BUTTON':
        const currentIndex = state.players.findIndex((player) => player.id === state.currentBoardId);
        const prevBoardId = state.players[(currentIndex - 1 + state.players.length) % state.players.length].id;
        dispatch({ type: 'CURRENT_BOARD_ID', currentBoardId: prevBoardId });
        break;
      case 'ON_CLICK_NEXT_BOARD_BUTTON':
        const nextIndex = state.players.findIndex((player) => player.id === state.currentBoardId);
        const nextBoardId = state.players[(nextIndex + 1) % state.players.length].id;
        dispatch({ type: 'CURRENT_BOARD_ID', currentBoardId: nextBoardId });
        break;
      case 'ON_CLICK_ROLL_BUTTON':
        if (auth.id !== state.turn.id) {
          notMyTurnToast();
        } else {
          dispatch({ type: 'SAVE_KEPT' });
          dispatch({ type: 'ROLLING', rolling: true });
        }
        break;
      case 'ON_ROLL_FINISH':
        dispatch({ type: 'ROLLING', rolling: false });
        await updateYachtDiceState(lounge.id, { 'dice': event.values, 'rolls-decrease': 1 })
          .catch((error) => { if (error.code === 'PERMISSION_DENIED') notMyTurnToast() });
        break;
      case 'ON_ADD_DICE_TO_KEEP':
        await updateYachtDiceState(lounge.id, { 'keep-add': event.index })
          .catch((error) => { if (error.code === 'PERMISSION_DENIED') notMyTurnToast() });
        break;
      case 'ON_REMOVE_DICE_TO_KEEP':
        await updateYachtDiceState(lounge.id, { 'keep-remove': event.index })
          .catch((error) => { if (error.code === 'PERMISSION_DENIED') notMyTurnToast() });
        break;
      case 'ON_CLICK_SELECT_HAND_BUTTON':
        await updateYachtDiceState(lounge.id, { 'boards': { key: event.key, value: event.value } })
          .catch((error) => { if (error.code === 'PERMISSION_DENIED') notMyTurnToast() });
        break;
      default:
        break;
    }
  };
  
  useEffect(() => {
    if (lounge.loading) return;

    if (lounge.game.name !== '요트다이스') {
      toast({ title: '게임방이 존재하지 않습니다.', status: 'error', duration: 2000 });
      navigate('/main', { replace: true });
      return;
    }

    const unsubscribe = onYachtDiceStateChanged(lounge.id, async (yachtDice) => {
      const players = await fetchUsersByIds(yachtDice.playerIds);
      dispatch({ type: 'PLAYERS', players });
      dispatch({ type: 'ROUND', round: yachtDice.round });
      dispatch({ type: 'BOARDS', boards: yachtDice.boards });
      dispatch({ type: 'CURRENT_BOARD_ID', currentBoardId: auth.id });
      const turn = await fetchUserById(yachtDice.turn);
      dispatch({ type: 'TURN', turn });
      dispatch({ type: 'DICE', dice: yachtDice.dice });
      dispatch({ type: 'KEEP', keep: yachtDice.keep ?? [] });
      dispatch({ type: 'ROLLS', rolls: yachtDice.rolls });
      if (yachtDice.rolls === 0) {
        dispatch({ type: 'SAVE_KEPT' });
      } else if (yachtDice.rolls === 3) {
        dispatch({ type: 'CLEAR_KEPT' });
      }
      setLoading(false);

      if (yachtDice.turn === auth.id && yachtDice.rolls === 3) {
        toast({ title: '내 차례입니다.', status: 'info', duration: 2000 });
      }
      if (yachtDice.finishedAt) {
        onOpen();
      }
    });

    return () => unsubscribe();
  }, [lounge.id, lounge.loading]);

  return {
    state,
    loading,
    modal,
    onEvent
  };
}