import { DavinciCodeTile } from './DavinciCodeTile';

export interface DavinciCode {
  loungeId: string;
  playerIds: string[];
  hands: {
    [key: string]: DavinciCodeTile[];
  };
  turn: string;
  phase: 'INITIAL_DRAW' | 'DRAW' | 'GUESS';
  finishedPlayerIds: string[];
  remainingTiles: {
    white: DavinciCodeTile[];
    black: DavinciCodeTile[];
  };
  pendingTiles: DavinciCodeTile[];
  finishedAt?: object;
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
