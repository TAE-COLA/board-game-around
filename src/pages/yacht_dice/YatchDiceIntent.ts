import { User, YachtDiceBoard } from 'models';
import { createDummy } from 'shared';

type YatchDiceState = {
  players: User[];
  round: number;
  boards: {
    [key: string]: YachtDiceBoard;
  };
  currentBoardPlayer: User;
  turn: User;
  dice: number[];
  kept: number[];
  keep: number[];
  rolls: number;
  rolling: boolean;
};

const initialState: YatchDiceState = {
  players: [],
  round: 0,
  boards: {},
  currentBoardPlayer: createDummy<User>(),
  turn: createDummy<User>(),
  dice: [0, 0, 0, 0, 0],
  kept: [],
  keep: [],
  rolls: 0,
  rolling: false,
};

type YatchDiceEvent = {
  onClickExitButton: () => void;
  onClickPrevBoardButton: () => void;
  onClickNextBoardButton: () => void;
  onClickRollButton: () => void;
  onRollFinish: (values: number[]) => void;
  onAddDiceToKeep: (index: number) => void;
  onRemoveDiceToKeep: (index: number) => void;
  onClickSelectHandButton: (key: string, value: number) => void;
};

type YatchDiceReduce =
  | { type: 'PLAYERS'; players: User[] }
  | { type: 'ROUND'; round: number }
  | { type: 'BOARDS'; boards: { [key: string]: YachtDiceBoard } }
  | { type: 'CURRENT_BOARD_PLAYER'; currentBoardPlayer: User }
  | { type: 'TURN'; turn: User }
  | { type: 'DICE'; dice: number[] }
  | { type: 'SAVE_KEPT' }
  | { type: 'CLEAR_KEPT' }
  | { type: 'KEEP'; keep: number[] }
  | { type: 'ADD_KEEP'; index: number }
  | { type: 'REMOVE_KEEP'; index: number }
  | { type: 'ROLLS'; rolls: number }
  | { type: 'ROLLING'; rolling: boolean };

const handleYatchDiceReduce = (state: YatchDiceState, reduce: YatchDiceReduce): YatchDiceState => {
  switch (reduce.type) {
    case 'PLAYERS':
      return { ...state, players: reduce.players };
    case 'ROUND':
      return { ...state, round: reduce.round };
    case 'BOARDS':
      return { ...state, boards: reduce.boards };
    case 'CURRENT_BOARD_PLAYER':
      return { ...state, currentBoardPlayer: reduce.currentBoardPlayer };
    case 'TURN':
      return { ...state, turn: reduce.turn };
    case 'DICE':
      return { ...state, dice: reduce.dice };
    case 'SAVE_KEPT':
      return { ...state, kept: state.keep };
    case 'CLEAR_KEPT':
      return { ...state, kept: [] };
    case 'KEEP':
      return { ...state, keep: reduce.keep };
    case 'ADD_KEEP':
      return { ...state, keep: [...state.keep, reduce.index] };
    case 'REMOVE_KEEP':
      return {
        ...state,
        keep: state.keep.filter((index) => index !== reduce.index),
      };
    case 'ROLLS':
      return { ...state, rolls: reduce.rolls };
    case 'ROLLING':
      return { ...state, rolling: reduce.rolling };
    default:
      return state;
  }
};

export {
  YatchDiceEvent as event,
  initialState,
  YatchDiceReduce as reduce,
  handleYatchDiceReduce as reducer,
  YatchDiceState as state,
};
