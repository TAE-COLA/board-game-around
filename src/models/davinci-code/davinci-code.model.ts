import { DavinciCodeTileModel } from './davinci-code-tile.model';

export interface DavinciCode {
  loungeId: string;
  playerIds: string[];
  hands: {
    [key: string]: DavinciCodeTileModel[];
  };
  turn: string;
  phase: DavinciCodePhase;
  finishedPlayerIds: string[];
  remainingTiles: {
    white: DavinciCodeTileModel[];
    black: DavinciCodeTileModel[];
  };
  pendingTiles: DavinciCodeTileModel[];
  finishedAt: Date;
}

export enum DavinciCodePhase {
  INITIAL_DRAW = 'INITIAL_DRAW',
  DRAW = 'DRAW',
  GUESS = 'GUESS',
}

export const DAVINCI_CODE = {
  reference: 'DavinciCode',
  loungeId: 'loungeId',
  playerIds: 'playerIds',
  hands: 'hands',
  turn: 'turn',
  phase: 'phase',
  finishedPlayerIds: 'finishedPlayerIds',
  remainingTiles: 'remainingTiles',
  white: 'white',
  black: 'black',
  pendingTiles: 'pendingTiles',
  finishedAt: 'finishedAt',
} as const;
