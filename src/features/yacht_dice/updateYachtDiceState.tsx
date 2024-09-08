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
  
  if (payloads['boards'] !== undefined) {
    updates[`/${YACHT_DICE_REFERENCE}/${loungeId}/${YACHT_DICE_BOARDS}`] = payloads['boards'];
  }
  if (payloads['turn'] !== undefined) {
    updates[`/${YACHT_DICE_REFERENCE}/${loungeId}/${YACHT_DICE_TURN}`] = payloads['turn'];
  }
  if (payloads['dice'] !== undefined) {
    updates[`/${YACHT_DICE_REFERENCE}/${loungeId}/${YACHT_DICE_DICE}`] = payloads['dice'];
  }
  if (payloads['keep-add'] !== undefined) {
    const currentKeep = (await get(child(loungeReference, YACHT_DICE_KEEP))).val() || [];
    const newKeep = [...currentKeep, payloads['keep-add']];
    updates[`/${YACHT_DICE_REFERENCE}/${loungeId}/${YACHT_DICE_KEEP}`] = newKeep;
  }
  if (payloads['keep-remove'] !== undefined) {
    const currentRolls = (await get(child(loungeReference, YACHT_DICE_ROLLS))).val() || 0;
    if (currentRolls === 0) {
      throw new Error('No more rolls left');
    }
    const currentKeep = (await get(child(loungeReference, YACHT_DICE_KEEP))).val() || [];
    const newKeep = currentKeep.filter((index: number) => index !== payloads['keep-remove']);
    updates[`/${YACHT_DICE_REFERENCE}/${loungeId}/${YACHT_DICE_KEEP}`] = newKeep;
  }
  if (payloads['rolls-decrease'] !== undefined) {
    const currentRolls = (await get(child(loungeReference, YACHT_DICE_ROLLS))).val() || 0;
    if (currentRolls === 0) {
      throw new Error('No more rolls left');
    } else if (currentRolls <= 1) {
      updates[`/${YACHT_DICE_REFERENCE}/${loungeId}/${YACHT_DICE_KEEP}`] = [0, 1, 2, 3, 4];
    }
    updates[`/${YACHT_DICE_REFERENCE}/${loungeId}/${YACHT_DICE_ROLLS}`] = currentRolls - payloads['rolls-decrease'];
  }
  
  await update(reference, updates);
};