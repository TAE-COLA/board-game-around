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
  phase: 'phase',
  finishedAt: 'finishedAt',
} as const;
