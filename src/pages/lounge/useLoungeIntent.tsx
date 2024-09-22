import { useToast } from '@chakra-ui/react';
import { startYachtDice, useAuth, useLounge } from 'features';
import { useEffect, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import { launch } from 'shared';

type LoungeState = {
  loading: boolean;
};

type LoungeEvent =
  | { type: 'SCREEN_INITIALIZE' }
  | { type: 'ON_CLICK_EXIT_BUTTON' }
  | { type: 'ON_CLICK_COPY_BUTTON' }
  | { type: 'ON_CLICK_START_BUTTON' };

type LoungeReduce =
  | { type: 'LOADING'; loading: boolean };

function handleLoungeReduce(state: LoungeState, reduce: LoungeReduce): LoungeState {
  switch (reduce.type) {
    case 'LOADING':
      return { ...state, loading: reduce.loading };
    default:
      return state;
  }
}

export function useLoungeIntent() {
  const initialState: LoungeState = {
    loading: true
  };
  const [state, dispatch] = useReducer(handleLoungeReduce, initialState);

  const navigate = useNavigate();
  const toast = useToast();

  const { user, loading: authLoading } = useAuth();
  const { loading: loungeLoading, exit,  ...lounge } = useLounge();

  const onEvent = async (event: LoungeEvent) => {
    switch (event.type) {
      case 'ON_CLICK_EXIT_BUTTON':
        await exit();
        toast({ title: '게임방을 나왔습니다.', duration: 2000 });
        navigate('/main', { replace: true });
        break;
      case 'ON_CLICK_COPY_BUTTON':
        navigator.clipboard.writeText(lounge.code);
        toast({ title: '게임방 코드가 복사되었습니다.', status: 'success', duration: 2000 });
        break;
      case 'ON_CLICK_START_BUTTON':
        await launch(dispatch, async () => {
          await startYachtDice(lounge.id);
        })
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    dispatch({ type: 'LOADING', loading: authLoading || loungeLoading });
  }, [authLoading, loungeLoading]);

  useEffect(() => {
    if (loungeLoading) return;

    if (lounge?.status === 'PLAYING') {
      navigate('/' + lounge.game.name, { replace: true });
    }
  }, [lounge.id, loungeLoading]);

  return {
    state,
    onEvent,
  };
}