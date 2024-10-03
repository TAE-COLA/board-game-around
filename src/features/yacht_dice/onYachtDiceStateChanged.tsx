import { YachtDice } from 'entities';
import { database } from 'features';
import { child, ref as fRefrence, onValue, type Unsubscribe } from 'firebase/database';

const YACHT_DICE_REFERENCE = 'YachtDice';

const YACHT_DICE_PLAYER_IDS = 'playerIds';
const YACHT_DICE_BOARDS = 'boards';
const YACHT_DICE_TURN = 'turn';
const YACHT_DICE_DICE = 'dice';
const YACHT_DICE_KEEP = 'keep';
const YACHT_DICE_ROLLS = 'rolls';

export const onYachtDiceStateChanged = (loungeId: string, onChanged: (yachtDice: YachtDice) => void): Unsubscribe => {
  const reference = fRefrence(database);
  const yachtReference = child(child(reference, YACHT_DICE_REFERENCE), loungeId);
  return onValue(yachtReference, (snapshot) => {
    const data = snapshot.val() as YachtDice;
    onChanged(data);
  });
};