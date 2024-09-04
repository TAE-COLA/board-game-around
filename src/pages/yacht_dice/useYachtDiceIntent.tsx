import { useToast } from '@chakra-ui/react';
import { User, YachtDiceBoard } from 'entities';
import { fetchUserById, fetchUsersByIds, onYachtDiceStateChanged, useAuth, useLounge } from 'features';
import { useEffect, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import { createDummy } from 'shared';

type YachtDiceState = {
  loading: boolean;
  user: User;
  players: User[];
  boards: {
    [key: string]: YachtDiceBoard;
  };
  turn: User;
  dice: number[];
  keep: boolean[];
  rolls: number;
  rolling: boolean;
};

type YachtDiceEvent =
  | { type: 'ON_CLICK_EXIT_BUTTON' }
  | { type: 'ON_CLICK_ROLL_BUTTON' }
  | { type: 'ON_ROLL_FINISH'; values: number[] }
  | { type: 'ON_CLICK_END_TURN_BUTTON' };

type YachtDiceReduce =
  | { type: 'LOADING'; loading: boolean }
  | { type: 'USER'; user: User }
  | { type: 'PLAYERS'; players: User[] }
  | { type: 'BOARDS'; boards: { [key: string]: YachtDiceBoard } }
  | { type: 'TURN'; turn: User }
  | { type: 'DICE'; dice: number[] }
  | { type: 'KEEP'; keep: boolean[] }
  | { type: 'ROLLS'; rolls: number }
  | { type: 'ROLLING'; rolling: boolean };

function handleYachtDiceReduce(state: YachtDiceState, reduce: YachtDiceReduce): YachtDiceState {
  switch (reduce.type) {
    case 'LOADING':
      return { ...state, loading: reduce.loading };
    case 'USER':
      return { ...state, user: reduce.user };
    case 'PLAYERS':
      return { ...state, players: reduce.players };
    case 'BOARDS':
      return { ...state, boards: reduce.boards };
    case 'TURN':
      return { ...state, turn: reduce.turn };
    case 'DICE':
      return { ...state, dice: reduce.dice };
    case 'KEEP':
      return { ...state, keep: reduce.keep };
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
    loading: true,
    user: createDummy<User>(),
    players: [],
    boards: {},
    turn: createDummy<User>(),
    dice: [0, 0, 0, 0, 0],
    keep: [false, false, false, false, false],
    rolls: 0,
    rolling: false
  };
  const [state, dispatch] = useReducer(handleYachtDiceReduce, initialState);

  const navigate = useNavigate();
  const toast = useToast();

  const { user, loading: authLoading } = useAuth();
  const { loading: loungeLoading, exit,  ...lounge } = useLounge();

  const onEvent = async (event: YachtDiceEvent) => {
    switch (event.type) {
      case 'ON_CLICK_EXIT_BUTTON':
        break;
      case 'ON_CLICK_ROLL_BUTTON':
        dispatch({ type: 'ROLLING', rolling: true });
        break;
      case 'ON_ROLL_FINISH':
        dispatch({ type: 'ROLLING', rolling: false });
        // TODO: 결과 전솔
        break;
      case 'ON_CLICK_END_TURN_BUTTON':
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (authLoading) return;

    if (user) dispatch({ type: 'USER', user });
  }, [user, authLoading]);

  useEffect(() => {
    if (loungeLoading) return;

    if (lounge && lounge.owner && lounge.players && !lounge.deletedAt && lounge.game.name === '요트다이스') {
      dispatch({ type: 'PLAYERS', players: lounge.players });
    } else {
      toast({ title: '게임방이 존재하지 않습니다.', status: 'error', duration: 2000 });
      navigate('/main', { replace: true });
    }
  }, [lounge.owner, lounge.players, lounge.deletedAt, lounge.game.name, loungeLoading]);

  useEffect(() => {
    if (loungeLoading) return;

    const unsubscribe = onYachtDiceStateChanged(lounge.id, async (yachtDice) => {
      if (yachtDice.playerIds) {
        const players = await fetchUsersByIds(yachtDice.playerIds);
        dispatch({ type: 'PLAYERS', players });
      }
      dispatch({ type: 'BOARDS', boards: yachtDice.boards });
      const turn = await fetchUserById(yachtDice.turn);
      dispatch({ type: 'TURN', turn });
      dispatch({ type: 'DICE', dice: yachtDice.dice });
      dispatch({ type: 'KEEP', keep: yachtDice.keep });
      dispatch({ type: 'ROLLS', rolls: yachtDice.rolls });
      dispatch({ type: 'LOADING', loading: false });
    });

    return () => unsubscribe();
  }, [lounge.id, loungeLoading]);
  
  return {
    state,
    onEvent
  };
}