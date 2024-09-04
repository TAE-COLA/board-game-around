import { useToast } from '@chakra-ui/react';
import { Game, User } from 'entities';
import { startYachtDice, useAuth, useLounge } from 'features';
import { useEffect, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import { createDummy, launch } from 'shared';

type LoungeState = {
  loading: boolean;
  user: User;
  loungeId: string;
  game: Game;
  code: string;
  owner: User;
  players: User[];
};

type LoungeEvent =
  | { type: 'SCREEN_INITIALIZE' }
  | { type: 'ON_CLICK_EXIT_BUTTON' }
  | { type: 'ON_CLICK_COPY_BUTTON' }
  | { type: 'ON_CLICK_START_BUTTON' };

type LoungeReduce =
  | { type: 'LOADING'; loading: boolean }
  | { type: 'USER'; user: User }
  | { type: 'LOUNGE_ID'; loungeId: string }
  | { type: 'GAME'; game: Game }
  | { type: 'CODE'; code: string }
  | { type: 'OWNER'; owner: User }
  | { type: 'PLAYERS'; players: User[] };

function handleLoungeReduce(state: LoungeState, reduce: LoungeReduce): LoungeState {
  switch (reduce.type) {
    case 'LOADING':
      return { ...state, loading: reduce.loading };
    case 'USER':
      return { ...state, user: reduce.user };
    case 'LOUNGE_ID':
      return { ...state, loungeId: reduce.loungeId };
    case 'GAME':
      return { ...state, game: reduce.game };
    case 'CODE':
      return { ...state, code: reduce.code };
    case 'OWNER':
      return { ...state, owner: reduce.owner };
    case 'PLAYERS':
      return { ...state, players: reduce.players };
    default:
      return state;
  }
}

export function useLoungeIntent() {
  const initialState: LoungeState = {
    loading: true,
    user: createDummy<User>(),
    loungeId: '',
    game: createDummy<Game>(),
    code: '',
    owner: createDummy<User>(),
    players: []
  };
  const [state, dispatch] = useReducer(handleLoungeReduce, initialState);

  const navigate = useNavigate();
  const toast = useToast();

  const { user, loading: authLoading } = useAuth();
  const { loading: loungeLoading, exit,  ...lounge } = useLounge();

  const onEvent = async (event: LoungeEvent) => {
    switch (event.type) {
      case 'ON_CLICK_EXIT_BUTTON':
        await exit(state.user.id);
        toast({ title: '게임방을 나왔습니다.', duration: 2000 });
        navigate('/main', { replace: true });
        break;
      case 'ON_CLICK_COPY_BUTTON':
        navigator.clipboard.writeText(state.code);
        toast({ title: '게임방 코드가 복사되었습니다.', status: 'success', duration: 2000 });
        break;
      case 'ON_CLICK_START_BUTTON':
        await launch(dispatch, async () => {
          await startYachtDice(state.loungeId);
        })
        navigate('/' + state.game.name, { replace: true });
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    dispatch({ type: 'LOADING', loading: authLoading || loungeLoading });
  }, [authLoading, loungeLoading]);

  useEffect(() => {
    if (authLoading) return;

    if (user) dispatch({ type: 'USER', user });
  }, [user, authLoading]);

  useEffect(() => {
    if (loungeLoading) return;

    dispatch({ type: 'LOUNGE_ID', loungeId: lounge.id });
    dispatch({ type: 'GAME', game: lounge.game });
    dispatch({ type: 'CODE', code: lounge.code });
    if (lounge && lounge.owner && lounge.players && !lounge.deletedAt) {
      dispatch({ type: 'OWNER', owner: lounge.owner });
      dispatch({ type: 'PLAYERS', players: lounge.players });
    } else {
      toast({ title: '게임방이 존재하지 않습니다.', status: 'error', duration: 2000 });
      navigate('/main', { replace: true });
    }
  }, [navigate, toast, lounge.game, lounge.code, lounge.owner, lounge.players, lounge.deletedAt, lounge, loungeLoading]);

  return {
    state,
    onEvent,
  };
}