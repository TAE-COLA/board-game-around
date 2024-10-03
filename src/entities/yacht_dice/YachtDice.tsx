import type YachtDiceBoard from './YachtDiceBoard';

export default interface YachtDice {
  loungeId: string;
  playerIds: string[];
  round: number;
  boards: {
    [key: string]: YachtDiceBoard;
  };
  turn: string;
  dice: number[];
  keep: number[];
  rolls: number;
  finishedAt?: object;
}