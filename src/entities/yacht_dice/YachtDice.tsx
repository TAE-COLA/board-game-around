import type YachtDiceBoard from './YachtDiceBoard';

export default interface YachtDice {
  loungeId: string;
  playerIds: string[];
  boards: {
    [key: string]: YachtDiceBoard;
  };
  turn: string;
  dice: number[];
  keep: boolean[];
  rolls: number;
}