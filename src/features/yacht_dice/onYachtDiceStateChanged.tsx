import { YachtDice } from 'entities';
import { database } from 'features';
import {
  child,
  ref as fRefrence,
  onValue,
  type Unsubscribe,
} from 'firebase/database';

const YACHT_DICE_REFERENCE = 'YachtDice';

export const onYachtDiceStateChanged = (
  loungeId: string,
  onChanged: (yachtDice: YachtDice) => void
): Unsubscribe => {
  const reference = fRefrence(database);
  const yachtReference = child(
    child(reference, YACHT_DICE_REFERENCE),
    loungeId
  );
  return onValue(yachtReference, (snapshot) => {
    const data = snapshot.val() as YachtDice;
    onChanged(data);
  });
};
