import { Game } from 'models';

type MainState = {
  gameList: Game[];
  selectedGame: Game | null;
};

const initialState: MainState = {
  gameList: [],
  selectedGame: null,
};

type MainEvent =
  | { type: 'ON_CLICK_LOGOUT_BUTTON' }
  | { type: 'ON_CLICK_GAME_PLAY_BUTTON'; game: Game }
  | { type: 'ON_CLICK_CREATE_LOUNGE_BUTTON' }
  | { type: 'ON_CLICK_JOIN_LOUNGE_BUTTON'; code: string };

type MainReduce = { type: 'GAME_LIST'; gameList: Game[] } | { type: 'SELECTED_GAME'; selectedGame: Game | null };

const handleMainReduce = (state: MainState, reduce: MainReduce): MainState => {
  switch (reduce.type) {
    case 'GAME_LIST':
      return { ...state, gameList: reduce.gameList };
    case 'SELECTED_GAME':
      return { ...state, selectedGame: reduce.selectedGame };
    default:
      return state;
  }
};

export { MainEvent as event, initialState, MainReduce as reduce, handleMainReduce as reducer, MainState as state };
