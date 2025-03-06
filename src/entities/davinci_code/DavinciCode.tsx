import DavinciCodeTile from './DavinciCodeTile';

export default interface DavinciCode {
  loungeId: string;
  playerIds: string[];
  hands: {
    [key: string]: DavinciCodeTile[];
  };
  turn: string;
  phase: 'DRAW' | 'GUESS';
  finishedPlayerIds: string[];
  remainingTiles: {
    white: DavinciCodeTile[];
    black: DavinciCodeTile[];
  };
  pendingTiles: DavinciCodeTile[];
  finishedAt?: object;
}
