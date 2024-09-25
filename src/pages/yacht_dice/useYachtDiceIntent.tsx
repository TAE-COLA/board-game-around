import { useToast } from '@chakra-ui/react';
import { User, YachtDiceBoard } from 'entities';
import { fetchUserById, onYachtDiceStateChanged, updateYachtDiceState, useAuthContext, useLoungeContext } from 'features';
import { useEffect, useReducer, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createDummy } from 'shared';

type YachtDiceState = {
  boards: {
    [key: string]: YachtDiceBoard;
  };
  turn: User;
  dice: number[];
  keep: number[];
  rolls: number;
  rolling: boolean;
};

type YachtDiceEvent =
  | { type: 'SCREEN_INITIALIZE' }
  | { type: 'ON_CLICK_EXIT_BUTTON' }
  | { type: 'ON_CLICK_ROLL_BUTTON' }
  | { type: 'ON_ROLL_FINISH'; values: number[] }
  | { type: 'ON_ADD_DICE_TO_KEEP'; index: number }
  | { type: 'ON_REMOVE_DICE_TO_KEEP'; index: number }
  | { type: 'ON_CLICK_SELECT_HAND_BUTTON'; key: string; value: number }
  | { type: 'ON_CLICK_WHEN_NOT_MY_TURN' };

type YachtDiceReduce =
  | { type: 'BOARDS'; boards: { [key: string]: YachtDiceBoard } }
  | { type: 'TURN'; turn: User }
  | { type: 'DICE'; dice: number[] }
  | { type: 'KEEP'; keep: number[] }
  | { type: 'ADD_KEEP'; index: number }
  | { type: 'REMOVE_KEEP'; index: number }
  | { type: 'ROLLS'; rolls: number }
  | { type: 'ROLLING'; rolling: boolean };

function handleYachtDiceReduce(state: YachtDiceState, reduce: YachtDiceReduce): YachtDiceState {
  switch (reduce.type) {
    case 'BOARDS':
      return { ...state, boards: reduce.boards };
    case 'TURN':
      return { ...state, turn: reduce.turn };
    case 'DICE':
      return { ...state, dice: reduce.dice };
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
    boards: {},
    turn: createDummy<User>(),
    dice: [0, 0, 0, 0, 0],
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

  const onEvent = async (event: YachtDiceEvent) => {
    switch (event.type) {
      case 'SCREEN_INITIALIZE':
        setLoading(false);
        break;
      case 'ON_CLICK_EXIT_BUTTON':
        break;
      case 'ON_CLICK_ROLL_BUTTON':
        if (auth.user.id !== state.turn.id) {
          onEvent({ type: 'ON_CLICK_WHEN_NOT_MY_TURN' });
        } else {
          dispatch({ type: 'ROLLING', rolling: true });
        }
        break;
      case 'ON_ROLL_FINISH':
        dispatch({ type: 'ROLLING', rolling: false });
        await updateYachtDiceState(lounge.id, { 'dice': event.values, 'rolls-decrease': 1 })
          .catch((error) => {
            if (error.message === 'No more rolls left') {
              toast({ title: '남은 횟수가 없습니다.', status: 'error', duration: 2000 });
            }
          });
        break;
      case 'ON_ADD_DICE_TO_KEEP':
        await updateYachtDiceState(lounge.id, { 'keep-add': event.index })
          .catch((error) => {
            if (error.code === 'PERMISSION_DENIED') {
              toast({ title: '내 차례가 아닙니다.', status: 'error', duration: 2000 });
            }
          });
        break;
      case 'ON_REMOVE_DICE_TO_KEEP':
        await updateYachtDiceState(lounge.id, { 'keep-remove': event.index })
          .catch((error) => {
            if (error.code === 'PERMISSION_DENIED') {
              toast({ title: '내 차례가 아닙니다.', status: 'error', duration: 2000 });
            }
          });
        break;
      case 'ON_CLICK_SELECT_HAND_BUTTON':
        await updateYachtDiceState(lounge.id, { 'boards': { key: event.key, value: event.value } })
          .catch((error) => {
            if (error.code === 'PERMISSION_DENIED') {
              toast({ title: '내 차례가 아닙니다.', status: 'error', duration: 2000 });
            }
          });
        break;
      case 'ON_CLICK_WHEN_NOT_MY_TURN':
        toast({ title: '내 차례가 아닙니다.', status: 'error', duration: 2000 });
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
    }
  }, [lounge.owner, lounge.players, lounge.game.name, lounge.loading]);

  useEffect(() => {
    if (lounge.loading) return;

    const unsubscribe = onYachtDiceStateChanged(lounge.id, async (yachtDice) => {
      dispatch({ type: 'BOARDS', boards: yachtDice.boards });
      const turn = await fetchUserById(yachtDice.turn);
      dispatch({ type: 'TURN', turn });
      dispatch({ type: 'DICE', dice: yachtDice.dice });
      dispatch({ type: 'KEEP', keep: yachtDice.keep ?? [] });
      dispatch({ type: 'ROLLS', rolls: yachtDice.rolls });

      if (yachtDice.turn === auth.user.id && yachtDice.rolls === 3) {
        toast({ title: '내 차례입니다.', status: 'info', duration: 2000 });
      }
    });

    return () => unsubscribe();
  }, [lounge.id, lounge.loading]);

  useEffect(() => {
    onEvent({ type: 'SCREEN_INITIALIZE' });
  }, []);
  
  return {
    state,
    loading,
    auth,
    lounge,
    onEvent
  };
}