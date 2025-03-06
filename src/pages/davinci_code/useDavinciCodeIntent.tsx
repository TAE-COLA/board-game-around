import { useDisclosure, useToast } from '@chakra-ui/react';
import { DavinciCodeTile, User } from 'entities';
import {
  drawDavinciCodeTile,
  exitLounge,
  exitYachtDice,
  fetchUserById,
  fetchUsersByIds,
  onDavinciCodeStateChanged,
  updateDavinciCodeHand,
  useAuthContext,
  useLoungeContext,
} from 'features';
import { useEffect, useReducer, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createDummy, launch } from 'shared';

type DavinciCodeState = {
  players: User[];
  hands: {
    [key: string]: DavinciCodeTile[];
  };
  turn: User;
  finishedPlayers: User[];
  drawableTiles: number;
  pendingTiles: DavinciCodeTile[];
};

type DavinciCodeEvent =
  | { type: 'ON_CLICK_EXIT_BUTTON' }
  | { type: 'ON_CLICK_DRAW_BUTTON'; isWhite: boolean }
  | { type: 'ON_SUBMIT_HAND'; hand: DavinciCodeTile[] }
  | { type: 'ON_CLICK_TILE'; player: User; index: number };

type DavinciCodeReduce =
  | { type: 'PLAYERS'; players: User[] }
  | { type: 'HANDS'; hands: { [key: string]: DavinciCodeTile[] } }
  | { type: 'TURN'; turn: User }
  | { type: 'FINISHED_PLAYERS'; finishedPlayers: User[] }
  | { type: 'DRAWABLE_TILES'; drawableTiles: number }
  | { type: 'PENDING_TILES'; pendingTiles: DavinciCodeTile[] };

function handleDavinciCodeReduce(
  state: DavinciCodeState,
  reduce: DavinciCodeReduce
): DavinciCodeState {
  switch (reduce.type) {
    case 'PLAYERS':
      return { ...state, players: reduce.players };
    case 'HANDS':
      return { ...state, hands: reduce.hands };
    case 'TURN':
      return { ...state, turn: reduce.turn };
    case 'FINISHED_PLAYERS':
      return { ...state, finishedPlayers: reduce.finishedPlayers };
    case 'PENDING_TILES':
      return { ...state, pendingTiles: reduce.pendingTiles };
    default:
      return state;
  }
}

export function useDavinciCodeIntent() {
  const initialState: DavinciCodeState = {
    players: [],
    hands: {},
    turn: createDummy<User>(),
    finishedPlayers: [],
    drawableTiles: 0,
    pendingTiles: [],
  };

  const [state, dispatch] = useReducer(handleDavinciCodeReduce, initialState);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const toast = useToast();

  const auth = useAuthContext();
  const lounge = useLoungeContext();

  const resultModal = useDisclosure();
  const drawModal = useDisclosure();
  const numberModal = useDisclosure();

  const modal = {
    resultModal: {
      isOpen: resultModal.isOpen,
      onOpen: resultModal.onOpen,
      onClose() {
        navigate('/main', { replace: true });
        resultModal.onClose();
      },
    },
    drawModal: {
      isOpen: drawModal.isOpen,
      onOpen: drawModal.onOpen,
      onClose() {
        dispatch({ type: 'DRAWABLE_TILES', drawableTiles: 0 });
        drawModal.onClose();
      },
    },
    numberModal: {
      isOpen: numberModal.isOpen,
      onOpen: numberModal.onOpen,
      onClose: numberModal.onClose,
    },
  };

  // const notMyTurnToast = () =>
  //   toast({ title: '내 차례가 아닙니다.', status: 'error', duration: 2000 });

  const onEvent = async (event: DavinciCodeEvent) => {
    switch (event.type) {
      case 'ON_CLICK_EXIT_BUTTON':
        await launch(setLoading, async () => {
          await exitLounge(lounge.id, auth.id);
          await exitYachtDice(lounge.id, auth.id);
          toast({ title: '게임방을 나왔습니다.', duration: 2000 });
          navigate('/main', { replace: true });
        });
        break;
      case 'ON_CLICK_DRAW_BUTTON':
        await drawDavinciCodeTile(lounge.id, event.isWhite);
        break;
      case 'ON_SUBMIT_HAND':
        await updateDavinciCodeHand(lounge.id, auth.id, event.hand, true);
        break;
      case 'ON_CLICK_TILE':
        modal.numberModal.onOpen();
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (lounge.loading) return;

    if (lounge.game.name !== '다빈치코드') {
      toast({
        title: '게임방이 존재하지 않습니다.',
        status: 'error',
        duration: 2000,
      });
      navigate('/main', { replace: true });
      return;
    }

    const unsubscribe = onDavinciCodeStateChanged(
      lounge.id,
      async (davinciCode) => {
        const players = await fetchUsersByIds(davinciCode.playerIds);
        dispatch({ type: 'PLAYERS', players });
        dispatch({ type: 'HANDS', hands: davinciCode.hands });
        const turn = await fetchUserById(davinciCode.turn);
        dispatch({ type: 'TURN', turn });
        if (davinciCode.finishedPlayerIds.length) {
          const finishedPlayers = await fetchUsersByIds(
            davinciCode.finishedPlayerIds
          );
          dispatch({
            type: 'FINISHED_PLAYERS',
            finishedPlayers: finishedPlayers,
          });
        }
        setLoading(false);

        if (davinciCode.turn === auth.id && davinciCode.phase === 'DRAW') {
          dispatch({
            type: 'PENDING_TILES',
            pendingTiles: davinciCode.pendingTiles,
          });

          if (davinciCode.hands[auth.id].length === 0) {
            dispatch({ type: 'DRAWABLE_TILES', drawableTiles: 4 });
            modal.drawModal.onOpen();
          } else {
            dispatch({ type: 'DRAWABLE_TILES', drawableTiles: 1 });
            modal.drawModal.onOpen();
          }
        }

        if (davinciCode.finishedAt) {
          modal.resultModal.onOpen();
        }

        return () => unsubscribe();
      }
    );
  }, [lounge.id, lounge.loading]);

  return {
    state,
    loading,
    modal,
    onEvent,
  };
}
