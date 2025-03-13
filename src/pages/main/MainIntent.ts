import { Game } from 'models';

type MainState = {
  gameList: Game[];
  selectedGame: Game | null;
};

const initialState: MainState = {
  gameList: [],
  selectedGame: null,
};

type MainEvent = {
  onClickLogoutButton: () => void;
  onClickGamePlayButton: (game: Game) => void;
  onClickCreateLoungeButton: () => void;
  onClickJoinLoungeButton: (code: string) => void;
};

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
