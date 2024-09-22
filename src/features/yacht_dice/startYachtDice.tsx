import { Lounge, YachtDiceBoard } from 'entities';
import { database } from 'features';
import { child, ref as fReference, get, update } from 'firebase/database';

const YACHT_DICE_REFERENCE = 'YachtDice';
const LOUNGE_REFERENCE = 'Lounge';

const YACHT_DICE_PLAYER_IDS = 'playerIds';
const YACHT_DICE_BOARDS = 'boards';
const YACHT_DICE_TURN = 'turn';
const YACHT_DICE_DICE = 'dice';
const YACHT_DICE_KEEP = 'keep';
const YACHT_DICE_ROLLS = 'rolls';

const LOUNGE_STATUS = 'status';

export const startYachtDice = async (loungeId: string): Promise<void> => {
  const reference = fReference(database);

  const loungeReference = child(child(reference, LOUNGE_REFERENCE), loungeId);
  const lounge = (await get(loungeReference)).val() as Lounge;

  if (!lounge || !lounge.playerIds || !lounge.ownerId) return;

  const initialYachtDiceBoard: YachtDiceBoard = {
    ace: { value: 0, marked: false },
    double: { value: 0, marked: false },
    triple: { value: 0, marked: false },
    quadra: { value: 0, marked: false },
    penta: { value: 0, marked: false },
    hexa: { value: 0, marked: false },
    bonus: { value: 0, marked: false },
    choice: { value: 0, marked: false },
    fourKind: { value: 0, marked: false },
    fullHouse: { value: 0, marked: false },
    smStraight: { value: 0, marked: false },
    lgStraight: { value: 0, marked: false },
    yacht: { value: 0, marked: false },
  };

  const shuffledPlayerIds = lounge.playerIds.sort(() => Math.random() - 0.5);
  const yachtDice = {
    playerIds: shuffledPlayerIds,
    boards: shuffledPlayerIds.reduce((acc, playerId) => {
      acc[playerId] = { ...initialYachtDiceBoard };
      return acc;
    }, {} as { [key: string]: YachtDiceBoard }),
    turn: shuffledPlayerIds[0],
    dice: [1, 1, 1, 1, 1],
    keep: [],
    rolls: 3
  };

  const updates = {
    [`/${LOUNGE_REFERENCE}/${loungeId}/${LOUNGE_STATUS}`]: 'PLAYING',
    [`/${YACHT_DICE_REFERENCE}/${loungeId}`]: yachtDice
  };

  await update(reference, updates);
};