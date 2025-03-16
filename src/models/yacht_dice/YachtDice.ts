import type { YachtDiceBoard } from './YachtDiceBoard';

export interface YachtDice {
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

export const YACHT_DICE = {
  reference: 'YachtDice',
  loungeId: 'loungeId',
  playerIds: 'playerIds',
  round: 'round',
  boards: 'boards',
  turn: 'turn',
  dice: 'dice',
  keep: 'keep',
  rolls: 'rolls',
  finishedAt: 'finishedAt',
} as const;
