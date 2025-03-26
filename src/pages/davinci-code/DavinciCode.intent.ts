import { DavinciCodePhase, DavinciCodeTileModel, User } from 'models';
import { createDummy, ToastOptions } from 'shared';

export type State = {
  players: User[];
  hands: { [key: string]: DavinciCodeTileModel[] };
  turn: User;
  phase: DavinciCodePhase;
  finishedPlayers: User[];
  pendingTiles: DavinciCodeTileModel[];
  drawableTiles: number;
};

export const createState = (partial?: Partial<State>): State => ({
  players: [],
  hands: {},
  turn: createDummy<User>(),
  phase: DavinciCodePhase.DRAW,
  finishedPlayers: [],
  pendingTiles: [],
  drawableTiles: 0,
  ...partial,
});

export type Event = {
  onClickExitButton: () => void;
  onClickDrawButton: (isWhite: boolean) => void;
  onSubmitHand: (hand: DavinciCodeTileModel[]) => void;
  onClickTile: (player: User, index: number) => void;
};

export enum Reduces {
  UPDATE_PLAYERS = 'UPDATE_PLAYERS',
  UPDATE_HANDS = 'UPDATE_HANDS',
  UPDATE_TURN = 'UPDATE_TURN',
  UPDATE_PHASE = 'UPDATE_PHASE',
  UPDATE_FINISHED_PLAYERS = 'UPDATE_FINISHED_PLAYERS',
  UPDATE_DRAWABLE_TILES = 'UPDATE_DRAWABLE_TILES',
  UPDATE_PENDING_TILES = 'UPDATE_PENDING_TILES',
}

type Reduce =
  | { type: Reduces.UPDATE_PLAYERS; players: User[] }
  | { type: Reduces.UPDATE_HANDS; hands: { [key: string]: DavinciCodeTileModel[] } }
  | { type: Reduces.UPDATE_TURN; turn: User }
  | { type: Reduces.UPDATE_PHASE; phase: DavinciCodePhase }
  | { type: Reduces.UPDATE_FINISHED_PLAYERS; finishedPlayers: User[] }
  | { type: Reduces.UPDATE_DRAWABLE_TILES; drawableTiles: number }
  | { type: Reduces.UPDATE_PENDING_TILES; pendingTiles: DavinciCodeTileModel[] };

export const reducer = (state: State, reduce: Reduce): State => {
  switch (reduce.type) {
    case Reduces.UPDATE_PLAYERS:
      return { ...state, players: reduce.players };
    case Reduces.UPDATE_HANDS:
      return { ...state, hands: reduce.hands };
    case Reduces.UPDATE_TURN:
      return { ...state, turn: reduce.turn };
    case Reduces.UPDATE_PHASE:
      return { ...state, phase: reduce.phase };
    case Reduces.UPDATE_FINISHED_PLAYERS:
      return { ...state, finishedPlayers: reduce.finishedPlayers };
    case Reduces.UPDATE_DRAWABLE_TILES:
      return { ...state, drawableTiles: reduce.drawableTiles };
    case Reduces.UPDATE_PENDING_TILES:
      return { ...state, pendingTiles: reduce.pendingTiles };
    default:
      return state;
  }
};

export enum SideEffects {
  NAVIGATE_TO_MAIN = 'NAVIGATE_TO_MAIN',
  SHOW_TOAST = 'SHOW_TOAST',
}

export type SideEffect =
  | { type: SideEffects.NAVIGATE_TO_MAIN }
  | { type: SideEffects.SHOW_TOAST; options: ToastOptions }
  | undefined;
