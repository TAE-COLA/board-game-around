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
