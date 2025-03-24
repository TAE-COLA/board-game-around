import { Game } from 'models';
import { ToastOptions } from 'shared';

export type State = {
  gameList: Game[];
  selectedGame?: Game;
};

export const createState = (partial?: Partial<State>): State => ({
  gameList: [],
  selectedGame: undefined,
  ...partial,
});

export type Event = {
  onClickLogoutButton: () => void;
  onClickGamePlayButton: (game: Game) => void;
  onClickCreateLoungeButton: () => void;
  onClickJoinLoungeButton: (code: string) => void;
};

export enum Reduces {
  UPDATE_GAME_LIST = 'UPDATE_GAME_LIST',
  UPDATE_SELECTED_GAME = 'UPDATE_SELECTED_GAME',
}

type Reduce =
  | { type: Reduces.UPDATE_GAME_LIST; gameList: Game[] }
  | { type: Reduces.UPDATE_SELECTED_GAME; selectedGame?: Game };

export const reducer = (state: State, reduce: Reduce): State => {
  switch (reduce.type) {
    case Reduces.UPDATE_GAME_LIST:
      return createState({ ...state, gameList: reduce.gameList });
    case Reduces.UPDATE_SELECTED_GAME:
      return createState({ ...state, selectedGame: reduce.selectedGame });
    default:
      return state;
  }
};

export enum SideEffects {
  NAVIGATE_TO_LOGIN = 'NAVIGATE_TO_LOGIN',
  NAVIGATE_TO_LOUNGE = 'NAVIGATE_TO_LOUNGE',
  SHOW_TOAST = 'SHOW_TOAST',
}

export type SideEffect =
  | { type: SideEffects.NAVIGATE_TO_LOGIN }
  | { type: SideEffects.NAVIGATE_TO_LOUNGE }
  | { type: SideEffects.SHOW_TOAST; options: ToastOptions };
