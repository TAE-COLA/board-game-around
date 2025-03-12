import { DavinciCodeTile, User } from 'models';
import { createDummy } from 'shared';

type DavinciCodeState = {
  players: User[];
  hands: {
    [key: string]: DavinciCodeTile[];
  };
  turn: User;
  phase: 'INITIAL_DRAW' | 'DRAW' | 'GUESS';
  finishedPlayers: User[];
  pendingTiles: DavinciCodeTile[];
  drawableTiles: number;
};

const initialState: DavinciCodeState = {
  players: [],
  hands: {},
  turn: createDummy<User>(),
  phase: 'DRAW',
  finishedPlayers: [],
  pendingTiles: [],
  drawableTiles: 0,
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
  | { type: 'PHASE'; phase: 'INITIAL_DRAW' | 'DRAW' | 'GUESS' }
  | { type: 'FINISHED_PLAYERS'; finishedPlayers: User[] }
  | { type: 'DRAWABLE_TILES'; drawableTiles: number }
  | { type: 'PENDING_TILES'; pendingTiles: DavinciCodeTile[] };

const handleDavinciCodeReduce = (state: DavinciCodeState, reduce: DavinciCodeReduce): DavinciCodeState => {
  switch (reduce.type) {
    case 'PLAYERS':
      return { ...state, players: reduce.players };
    case 'HANDS':
      return { ...state, hands: reduce.hands };
    case 'TURN':
      return { ...state, turn: reduce.turn };
    case 'PHASE':
      return { ...state, phase: reduce.phase };
    case 'FINISHED_PLAYERS':
      return { ...state, finishedPlayers: reduce.finishedPlayers };
    case 'DRAWABLE_TILES':
      return { ...state, drawableTiles: reduce.drawableTiles };
    case 'PENDING_TILES':
      return { ...state, pendingTiles: reduce.pendingTiles };
    default:
      return state;
  }
};

export {
  DavinciCodeEvent as event,
  initialState,
  DavinciCodeReduce as reduce,
  handleDavinciCodeReduce as reducer,
  DavinciCodeState as state,
};
