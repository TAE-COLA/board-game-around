import { YachtDiceBoard } from 'entities';
import { database } from 'features';
import { child, ref as fReference, get, update } from 'firebase/database';

const YACHT_DICE_REFERENCE = 'YachtDice';

const YACHT_DICE_PLAYER_IDS = 'playerIds';
const YACHT_DICE_BOARDS = 'boards';
const YACHT_DICE_TURN = 'turn';
const YACHT_DICE_DICE = 'dice';
const YACHT_DICE_KEEP = 'keep';
const YACHT_DICE_ROLLS = 'rolls';

type Payloads = {
  'boards'?: { [key: string]: YachtDiceBoard };
  'turn'?: string;
  'dice'?: number[];
  'keep-add'?: number;
  'keep-remove'?: number;
  'rolls-decrease'?: number;
};

export const updateYachtDiceState = async (
  loungeId: string, 
  payloads: Payloads
): Promise<void> => {
  const reference = fReference(database);
  const loungeReference = child(reference, `${YACHT_DICE_REFERENCE}/${loungeId}`);

  const updates: { [key: string]: any } = {};

  Object.entries(payloads).forEach(async ([key, value]) => {
    switch (key) {
      case 'boards':
        updates[`/${YACHT_DICE_REFERENCE}/${loungeId}/${YACHT_DICE_BOARDS}`] = value;
        break;
      case 'turn':
        updates[`/${YACHT_DICE_REFERENCE}/${loungeId}/${YACHT_DICE_TURN}`] = value;
        break;
      case 'dice':
        updates[`/${YACHT_DICE_REFERENCE}/${loungeId}/${YACHT_DICE_DICE}`] = value;
        break;
        case 'keep-add': {
          const currentKeep = (await get(child(loungeReference, YACHT_DICE_KEEP))).val() || [];
          const newKeep = [...currentKeep, value];
          updates[`/${YACHT_DICE_REFERENCE}/${loungeId}/${YACHT_DICE_KEEP}`] = newKeep;
          break;
        }
        case 'keep-remove': {
          const currentKeep = (await get(child(loungeReference, YACHT_DICE_KEEP))).val() || [];
          const newKeep = currentKeep.filter((index: number) => index !== value);
          updates[`/${YACHT_DICE_REFERENCE}/${loungeId}/${YACHT_DICE_KEEP}`] = newKeep;
          break;
        }
      case 'rolls-decrease':
        const currentRolls = (await get(child(loungeReference, YACHT_DICE_ROLLS))).val() || 0;
        updates[`/${YACHT_DICE_REFERENCE}/${loungeId}/${YACHT_DICE_ROLLS}`] = currentRolls - 1;
        break;
    }
  });
  
  await update(reference, updates);
};