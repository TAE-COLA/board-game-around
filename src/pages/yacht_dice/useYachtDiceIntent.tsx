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
};

type YachtDiceEvent =
  | { type: 'ON_CLICK_EXIT_BUTTON' };

type YachtDiceReduce =
  | { type: 'LOADING'; loading: boolean }
  | { type: 'USER'; user: User }
  | { type: 'PLAYERS'; players: User[] }
  | { type: 'BOARDS'; boards: { [key: string]: YachtDiceBoard } }
  | { type: 'TURN'; turn: User }
  | { type: 'DICE'; dice: number[] }
  | { type: 'KEEP'; keep: boolean[] }
  | { type: 'ROLLS'; rolls: number };

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
    rolls: 0
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