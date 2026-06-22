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
  starVotePlayerIds: string[] = [];
  lastPlayedAt: number | null = null;
  lastResult: TheMind['lastResult'] = null;
  emojis: TheMind['emojis'] = {};
  serverTimeOffset = 0;
  phase: TheMindPhase = 'READY';

  constructor(state: Partial<State>) {
    Object.assign(this, state);
  }
}

type Event = {
  onClickExitButton: () => void;
  onClickReadyButton: () => void;
  onClickCard: (card: number) => void;
  onClickStarButton: () => void;
  onClickCancelStarVoteButton: () => void;
  onClickNextLevelButton: () => void;
  onClickRestartButton: () => void;
  onTimerExpired: (serverNow: number) => void;
  onClickEmoji: (emoji: string) => void;
};

type Reduce =
  | { type: 'UPDATE_PLAYERS'; players: User[] }
  | { type: 'UPDATE_GAME'; game: TheMind }
  | { type: 'UPDATE_SERVER_TIME_OFFSET'; serverTimeOffset: number };

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
        hands: reduce.game.hands ?? {},
        playedCards: reduce.game.playedCards ?? [],
        discardedCards: reduce.game.discardedCards ?? [],
        readyPlayerIds: reduce.game.readyPlayerIds ?? [],
        starVotePlayerIds: reduce.game.starVotePlayerIds ?? [],
        lastPlayedAt:
          typeof reduce.game.lastPlayedAt === 'number' ? reduce.game.lastPlayedAt : null,
        lastResult: reduce.game.lastResult ?? null,
        emojis: reduce.game.emojis ?? {},
        phase: reduce.game.phase,
      });
    case 'UPDATE_SERVER_TIME_OFFSET':
      return new State({ ...state, serverTimeOffset: reduce.serverTimeOffset });
  }
};

type SideEffect =
  | { type: 'NAVIGATE_TO_MAIN' }
  | { type: 'SHOW_TOAST'; options: ToastOptions }
  | undefined;

export { Event, Reduce, handleReduce as reducer, SideEffect, State };
