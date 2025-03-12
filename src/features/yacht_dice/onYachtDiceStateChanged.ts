import { database } from 'features';
import { child, ref as fRefrence, onValue, type Unsubscribe } from 'firebase/database';
import { YachtDice } from 'models';
import { CommonError, sanitize } from 'shared';

const YACHT_DICE_REFERENCE = 'YachtDice';

export const onYachtDiceStateChanged = (loungeId: string, onChanged: (yachtDice: YachtDice) => void): Unsubscribe => {
  const reference = fRefrence(database);
  const yachtReference = child(child(reference, YACHT_DICE_REFERENCE), loungeId);
  return onValue(yachtReference, (snapshot) => {
    const data = snapshot.val() as YachtDice;
    onChanged(
      sanitize(data, () => {
        throw new Error(CommonError.GAME_STATE_FAILED);
      }).val()
    );
  });
};
