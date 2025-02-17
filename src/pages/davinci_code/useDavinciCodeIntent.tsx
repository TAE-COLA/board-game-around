import { useDisclosure, useToast } from "@chakra-ui/react";
import { DavinciCodeTile, User } from "entities";
import { exitLounge, exitYachtDice, fetchUserById, fetchUsersByIds, onDavinciCodeStateChanged, useAuthContext, useLoungeContext } from "features";
import { useEffect, useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createDummy, launch } from "shared";

type DavinciCodeState = {
  players: User[];
  hands: {
    [key: string]: DavinciCodeTile[];
  };
  turn: User;
  finishedPlayers: User[];
}

type DavinciCodeEvent = 
	| { type: 'ON_CLICK_EXIT_BUTTON' }
	| { type: 'ON_CLICK_DRAW_BUTTON' };

type DavinciCodeReduce = 
	| { type: 'PLAYERS'; players: User[] }
	| { type: 'HANDS'; hands: { [key: string]: DavinciCodeTile[]; } }
	| { type: 'TURN'; turn: User }
	| { type: 'FINISHED_PLAYERS'; finishedPlayers: User[] };

function handleDavinciCodeReduce(state: DavinciCodeState, reduce: DavinciCodeReduce): DavinciCodeState {
	switch (reduce.type) {
		case 'PLAYERS':
			return { ...state, players: reduce.players };
		case 'HANDS':
			return { ...state, hands: reduce.hands };
		case 'TURN':
			return { ...state, turn: reduce.turn };
		case 'FINISHED_PLAYERS':
			return { ...state, finishedPlayers: reduce.finishedPlayers };
		default:
			return state;
	}
}

export function useDavinciCodeIntent() {
	const initialState: DavinciCodeState = {
		players: [],
		hands: {},
		turn: createDummy<User>(),
		finishedPlayers: []
	};

	const [state, dispatch] = useReducer(handleDavinciCodeReduce, initialState);
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
				break;
			default:
				break;
		}
	};

	useEffect(() => {
		if (lounge.loading) return;

		if (lounge.game.name !== '다빈치코드') {
			toast({ title: '게임방이 존재하지 않습니다.', status: 'error', duration: 2000 });
      navigate('/main', { replace: true });
      return;
		}

		const unsubscribe = onDavinciCodeStateChanged(lounge.id, async (davinciCode) => {
			const players = await fetchUsersByIds(davinciCode.playerIds);
			dispatch({ type: 'PLAYERS', players });
			dispatch({ type: 'HANDS', hands: davinciCode.hands });
			const turn = await fetchUserById(davinciCode.turn);
			dispatch({ type: 'TURN', turn });
			if (davinciCode.finishedPlayerIds) {
				const finishedPlayers = await fetchUsersByIds(davinciCode.finishedPlayerIds);
				dispatch({ type: 'FINISHED_PLAYERS', finishedPlayers: finishedPlayers });
			}
			setLoading(false);

			if (davinciCode.turn === auth.id) {
        toast({ title: '내 차례입니다.', status: 'info', duration: 2000 });
			}
			if (davinciCode.finishedAt) {
				onOpen();
			}

			return () => unsubscribe();
		});

	}, [lounge.id, lounge.loading]);

	return {
    state,
    loading,
    modal,
    onEvent
  };
}