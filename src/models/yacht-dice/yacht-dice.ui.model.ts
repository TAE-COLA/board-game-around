import { User } from '../user';
import { YachtDiceBoard } from './yatch-dice-board.model';

export interface YachtDiceUIModel {
  loungeId: string;
  players: User[];
  round: number;
  boards: {
    [key: string]: YachtDiceBoard;
  };
  turn: User;
  dice: number[];
  keep: number[];
  rolls: number;
  finishedAt?: Date;
}
