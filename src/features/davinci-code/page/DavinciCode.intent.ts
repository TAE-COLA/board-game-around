import { User } from 'features/auth';
import { DavinciCodeTile } from '../model';
import { createDummy, ToastOptions } from 'shared';

class State {
  players: User[] = [];
  hands: { [key: string]: DavinciCodeTile[] } = {};
  turn: User = createDummy<User>();
  phase: 'INITIAL_DRAW' | 'DRAW' | 'GUESS' = 'DRAW';
  finishedPlayers: User[] = [];
  pendingTiles: DavinciCodeTile[] = [];
  drawableTiles: number = 0;

  constructor(state: Partial<State>) {
    Object.assign(this, state);
  }
}

type Event = {
  onClickExitButton: () => void;
  onClickDrawButton: (isWhite: boolean) => void;
  onSubmitHand: (hand: DavinciCodeTile[]) => void;
  onClickTile: (player: User, index: number) => void;
};

type Reduce =
  | { type: 'UPDATE_PLAYERS'; players: User[] }
  | { type: 'UPDATE_HANDS'; hands: { [key: string]: DavinciCodeTile[] } }
  | { type: 'UPDATE_TURN'; turn: User }
  | { type: 'UPDATE_PHASE'; phase: 'INITIAL_DRAW' | 'DRAW' | 'GUESS' }
  | { type: 'UPDATE_FINISHED_PLAYERS'; finishedPlayers: User[] }
  | { type: 'UPDATE_DRAWABLE_TILES'; drawableTiles: number }
  | { type: 'UPDATE_PENDING_TILES'; pendingTiles: DavinciCodeTile[] };

const handleReduce = (state: State, reduce: Reduce): State => {
  switch (reduce.type) {
    case 'UPDATE_PLAYERS':
      return { ...state, players: reduce.players };
    case 'UPDATE_HANDS':
      return { ...state, hands: reduce.hands };
    case 'UPDATE_TURN':
      return { ...state, turn: reduce.turn };
    case 'UPDATE_PHASE':
      return { ...state, phase: reduce.phase };
    case 'UPDATE_FINISHED_PLAYERS':
      return { ...state, finishedPlayers: reduce.finishedPlayers };
    case 'UPDATE_DRAWABLE_TILES':
      return { ...state, drawableTiles: reduce.drawableTiles };
    case 'UPDATE_PENDING_TILES':
      return { ...state, pendingTiles: reduce.pendingTiles };
    default:
      return state;
  }
};

type SideEffect =
  | { type: 'NAVIGATE_TO_MAIN' }
  | { type: 'SHOW_TOAST'; options: ToastOptions }
  | undefined;

export { Event, Reduce, handleReduce as reducer, SideEffect, State };
