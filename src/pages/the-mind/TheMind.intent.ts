import { TheMind, TheMindPhase, User } from 'models';
import { ToastOptions } from 'shared';

class State {
  players: User[] = [];
  level = 1;
  maxLevel = 1;
  lives = 0;
  stars = 0;
  hands: TheMind['hands'] = {};
  playedCards: number[] = [];
  discardedCards: number[] = [];
  readyPlayerIds: string[] = [];
  phase: TheMindPhase = 'READY';

  constructor(state: Partial<State>) {
    Object.assign(this, state);
  }
}

type Event = {
  onClickExitButton: () => void;
};

type Reduce =
  | { type: 'UPDATE_PLAYERS'; players: User[] }
  | { type: 'UPDATE_GAME'; game: TheMind };

const handleReduce = (state: State, reduce: Reduce): State => {
  switch (reduce.type) {
    case 'UPDATE_PLAYERS':
      return new State({ ...state, players: reduce.players });
    case 'UPDATE_GAME':
      return new State({
        ...state,
        level: reduce.game.level,
        maxLevel: reduce.game.maxLevel,
        lives: reduce.game.lives,
        stars: reduce.game.stars,
        hands: reduce.game.hands,
        playedCards: reduce.game.playedCards ?? [],
        discardedCards: reduce.game.discardedCards ?? [],
        readyPlayerIds: reduce.game.readyPlayerIds ?? [],
        phase: reduce.game.phase,
      });
  }
};

type SideEffect =
  | { type: 'NAVIGATE_TO_MAIN' }
  | { type: 'SHOW_TOAST'; options: ToastOptions }
  | undefined;

export { Event, Reduce, handleReduce as reducer, SideEffect, State };
