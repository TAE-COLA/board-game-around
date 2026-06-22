export type TheMindPhase =
  | 'READY'
  | 'PLAYING'
  | 'LEVEL_COMPLETE'
  | 'GAME_WON'
  | 'GAME_LOST';

export interface TheMind {
  loungeId: string;
  playerIds: string[];
  level: number;
  maxLevel: number;
  lives: number;
  stars: number;
  hands: {
    [key: string]: number[];
  };
  playedCards: number[];
  discardedCards: number[];
  readyPlayerIds: string[];
  starVotePlayerIds: string[];
  lastPlayedAt?: number | null;
  lastResult?: {
    type: 'SUCCESS' | 'FAILURE';
    level: number;
    lives: number;
  } | null;
  emojis?: {
    [key: string]: {
      value: string;
      shownAt: number;
    };
  };
  phase: TheMindPhase;
  finishedAt?: Date;
}

export const THE_MIND = {
  reference: 'TheMind',
  loungeId: 'loungeId',
  playerIds: 'playerIds',
  level: 'level',
  maxLevel: 'maxLevel',
  lives: 'lives',
  stars: 'stars',
  hands: 'hands',
  playedCards: 'playedCards',
  discardedCards: 'discardedCards',
  readyPlayerIds: 'readyPlayerIds',
  starVotePlayerIds: 'starVotePlayerIds',
  lastPlayedAt: 'lastPlayedAt',
  lastResult: 'lastResult',
  emojis: 'emojis',
  phase: 'phase',
  finishedAt: 'finishedAt',
} as const;
