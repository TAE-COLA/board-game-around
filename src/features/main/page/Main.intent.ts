import { Game } from 'features/game';
import { ToastOptions } from 'shared';

class State {
  gameList: Game[] = [];
  selectedGame: Game | null = null;

  constructor(state: Partial<State>) {
    Object.assign(this, state);
  }
}

type Event = {
  onClickLogoutButton: () => void;
  onClickGamePlayButton: (game: Game) => void;
  onClickCreateLoungeButton: () => void;
  onClickJoinLoungeButton: (code: string) => void;
};

type Reduce =
  | { type: 'UPDATE_GAME_LIST'; gameList: Game[] }
  | { type: 'UPDATE_SELECTED_GAME'; selectedGame: Game | null };

const handleReduce = (state: State, reduce: Reduce): State => {
  switch (reduce.type) {
    case 'UPDATE_GAME_LIST':
      return new State({ ...state, gameList: reduce.gameList });
    case 'UPDATE_SELECTED_GAME':
      return new State({ ...state, selectedGame: reduce.selectedGame });
  }
};

type SideEffect =
  | { type: 'NAVIGATE_TO_LOGIN' }
  | { type: 'NAVIGATE_TO_LOUNGE' }
  | { type: 'SHOW_TOAST'; options: ToastOptions }
  | undefined;

export { Event, Reduce, handleReduce as reducer, SideEffect, State };
