import { User } from 'features/auth';
import { YachtDiceBoard } from '../model';
import { createDummy, ToastOptions } from 'shared';

class State {
  players: User[] = [];
  round = 0;
  boards: { [key: string]: YachtDiceBoard } = {};
  currentBoardPlayer = createDummy<User>();
  turn = createDummy<User>();
  dice = [0, 0, 0, 0, 0];
  kept: number[] = [];
  keep: number[] = [];
  rolls = 0;
  rolling = false;

  constructor(state: Partial<State>) {
    Object.assign(this, state);
  }
}

type Event = {
  onClickExitButton: () => void;
  onClickPrevBoardButton: () => void;
  onClickNextBoardButton: () => void;
  onClickRollButton: () => void;
  onRollFinish: (values: number[]) => void;
  onAddDiceToKeep: (index: number) => void;
  onRemoveDiceToKeep: (index: number) => void;
  onClickSelectHandButton: (key: keyof YachtDiceBoard, value: number) => void;
};

type Reduce =
  | { type: 'UPDATE_PLAYERS'; players: User[] }
  | { type: 'UPDATE_ROUND'; round: number }
  | { type: 'UPDATE_BOARDS'; boards: { [key: string]: YachtDiceBoard } }
  | { type: 'UPDATE_CURRENT_BOARD_PLAYER'; currentBoardPlayer: User }
  | { type: 'UPDATE_TURN'; turn: User }
  | { type: 'UPDATE_DICE'; dice: number[] }
  | { type: 'SAVE_KEPT' }
  | { type: 'CLEAR_KEPT' }
  | { type: 'UPDATE_KEEP'; keep: number[] }
  | { type: 'ADD_KEEP'; index: number }
  | { type: 'REMOVE_KEEP'; index: number }
  | { type: 'UPDATE_ROLLS'; rolls: number }
  | { type: 'UPDATE_ROLLING'; rolling: boolean };

const handleReduce = (state: State, reduce: Reduce): State => {
  switch (reduce.type) {
    case 'UPDATE_PLAYERS':
      return new State({ ...state, players: reduce.players });
    case 'UPDATE_ROUND':
      return new State({ ...state, round: reduce.round });
    case 'UPDATE_BOARDS':
      return new State({ ...state, boards: reduce.boards });
    case 'UPDATE_CURRENT_BOARD_PLAYER':
      return new State({ ...state, currentBoardPlayer: reduce.currentBoardPlayer });
    case 'UPDATE_TURN':
      return new State({ ...state, turn: reduce.turn });
    case 'UPDATE_DICE':
      return new State({ ...state, dice: reduce.dice });
    case 'SAVE_KEPT':
      return new State({ ...state, kept: state.keep });
    case 'CLEAR_KEPT':
      return new State({ ...state, kept: [] });
    case 'UPDATE_KEEP':
      return new State({ ...state, keep: reduce.keep });
    case 'ADD_KEEP':
      return new State({ ...state, keep: [...state.keep, reduce.index] });
    case 'REMOVE_KEEP':
      return new State({
        ...state,
        keep: state.keep.filter((index) => index !== reduce.index),
      });
    case 'UPDATE_ROLLS':
      return new State({ ...state, rolls: reduce.rolls });
    case 'UPDATE_ROLLING':
      return new State({ ...state, rolling: reduce.rolling });
  }
};

type SideEffect =
  | { type: 'POP_BACK_STACK' }
  | { type: 'SHOW_TOAST'; options: ToastOptions }
  | undefined;

export { Event, Reduce, handleReduce as reducer, SideEffect, State };
