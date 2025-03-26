import { User, YachtDiceBoard, YachtDiceUIModel } from 'models';
import { createDummy, ToastOptions } from 'shared';

class State {
  yachtDice: YachtDiceUIModel = createDummy<YachtDiceUIModel>();
  currentBoardPlayer = createDummy<User>();
  kept: number[] = [];
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
  | { type: 'UPDATE_YACHT_DICE'; yachtDice: YachtDiceUIModel }
  | { type: 'UPDATE_CURRENT_BOARD_PLAYER'; currentBoardPlayer: User }
  | { type: 'SAVE_KEPT' }
  | { type: 'CLEAR_KEPT' }
  | { type: 'UPDATE_ROLLING'; rolling: boolean };

const handleReduce = (state: State, reduce: Reduce): State => {
  switch (reduce.type) {
    case 'UPDATE_YACHT_DICE':
      return new State({ ...state, yachtDice: reduce.yachtDice });
    case 'UPDATE_CURRENT_BOARD_PLAYER':
      return new State({ ...state, currentBoardPlayer: reduce.currentBoardPlayer });
    case 'SAVE_KEPT':
      return new State({ ...state, kept: state.yachtDice.keep });
    case 'CLEAR_KEPT':
      return new State({ ...state, kept: [] });
    case 'UPDATE_ROLLING':
      return new State({ ...state, rolling: reduce.rolling });
  }
};

type SideEffect =
  | { type: 'POP_BACK_STACK' }
  | { type: 'SHOW_TOAST'; options: ToastOptions }
  | undefined;

export { Event, Reduce, handleReduce as reducer, SideEffect, State };
