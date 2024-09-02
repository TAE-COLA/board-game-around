import { useToast } from '@chakra-ui/react';
import { Game, Lounge, User } from 'entities';
import { fetchGameById, fetchLoungeById, fetchUserById, fetchUsersByIds, useAuth } from 'features';
import { useEffect, useReducer } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createDummy, launch } from 'shared';

type LoungeState = {
  loading: boolean;
  user: User;
  lounge: Lounge;
    game: Game;
    owner: User;
    members: User[];
};

type LoungeEvent =
  | { type: 'SCREEN_INITIALIZE' }
  | { type: 'ON_CLICK_EXIT_BUTTON' }
  | { type: 'ON_CLICK_COPY_BUTTON' }
  | { type: 'ON_CLICK_START_BUTTON' };

type LoungeReduce =
  | { type: 'LOADING'; loading: boolean }
  | { type: 'USER'; user: User }
  | { type: 'LOUNGE'; lounge: Lounge }
  | { type: 'GAME'; game: Game }
  | { type: 'OWNER'; owner: User }
  | { type: 'MEMBERS'; members: User[] };

function handleLoungeReduce(state: LoungeState, reduce: LoungeReduce): LoungeState {
  switch (reduce.type) {
    case 'LOADING':
      return { ...state, loading: reduce.loading };
    case 'USER':
      return { ...state, user: reduce.user };
    case 'LOUNGE':
      return { ...state, lounge: reduce.lounge };
    case 'GAME':
      return { ...state, game: reduce.game };
    case 'OWNER':
      return { ...state, owner: reduce.owner };
    case 'MEMBERS':
      return { ...state, members: reduce.members };
    default:
      return state;
  }
}

export function useLoungeIntent() {
  const initialState: LoungeState = {
    loading: false,
    user: createDummy<User>(),
    lounge: createDummy<Lounge>(),
    game: createDummy<Game>(),
    owner: createDummy<User>(),
    members: [],
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
          await launch(loading => dispatch({ type: 'LOADING', loading }), async () => {
            await fetchLoungeById(loungeId, async (lounge) => {
              dispatch({ type: 'LOUNGE', lounge });

              const game = await fetchGameById(lounge.gameId);
              dispatch({ type: 'GAME', game });

              const owner = await fetchUserById(lounge.ownerId);
              dispatch({ type: 'OWNER', owner: owner });

              const members = await fetchUsersByIds(lounge.memberIds);
              dispatch({ type: 'MEMBERS', members });
              
              dispatch({ type: 'LOADING', loading: false });
            });
          });
        }
        break;
      case 'ON_CLICK_EXIT_BUTTON':
        navigate(-1)
        break;
      case 'ON_CLICK_COPY_BUTTON':
        navigator.clipboard.writeText(state.lounge?.code || '');
        toast({ title: '게임방 코드가 복사되었습니다.', status: 'success', duration: 2000, isClosable: true });
        break;
      case 'ON_CLICK_START_BUTTON':
        toast({ title: '미구현', status: 'info', duration: 2000, isClosable: true });
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