import { useToast } from '@chakra-ui/react';
import { Lounge, User } from 'entities';
import { fetchLoungeById, useAuth } from 'features';
import { useEffect, useReducer } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

type LoungeState = {
  loading: boolean;
  lounge?: Lounge;
  user?: User;
};

type LoungeEvent =
  | { type: 'SCREEN_INITIALIZE' }
  | { type: 'ON_CLICK_BACK_BUTTON' };

type LoungeReduce =
  | { type: 'LOADING'; loading: boolean }
  | { type: 'LOUNGE'; lounge: Lounge }
  | { type: 'USER'; user: User };

function handleLoungeReduce(state: LoungeState, reduce: LoungeReduce): LoungeState {
  switch (reduce.type) {
    case 'LOADING':
      return { ...state, loading: reduce.loading };
    case 'LOUNGE':
      return { ...state, lounge: reduce.lounge };
    case 'USER':
      return { ...state, user: reduce.user };
    default:
      return state;
  }
}

export function useLoungeIntent() {
  const initialState: LoungeState = {
    loading: false
  };
  const [state, dispatch] = useReducer(handleLoungeReduce, initialState);

  const navigate = useNavigate();
  const toast = useToast();

  const { user } = useAuth();
  const { loungeId } = useParams();

  const onEvent = async (event: LoungeEvent) => {
    switch (event.type) {
      case 'SCREEN_INITIALIZE':
        if (loungeId) {
          fetchLoungeById(loungeId, (lounge) => {
            dispatch({ type: 'LOUNGE', lounge });
          });
        }
        break;
      case 'ON_CLICK_BACK_BUTTON':
        navigate(-1)
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (user) dispatch({ type: 'USER', user });
  }, [user]);

  return {
    state,
    onEvent,
  };
}