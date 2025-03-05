import { DavinciCode } from 'entities';
import { database } from 'features';
import {
  child,
  ref as fRefrence,
  onValue,
  type Unsubscribe,
} from 'firebase/database';

const DAVINCI_CODE_REFERENCE = 'DavinciCode';

const DAVINCI_CODE_PLAYER_IDS = 'playerIds';
const DAVINCI_CODE_HANDS = 'hands';
const DAVINCI_CODE_TURN = 'turn';
const DAVINCI_CODE_FINISHED_PLAYER_IDS = 'finishedPlayerIds';

export const onDavinciCodeStateChanged = (
  loungeId: string,
  onChanged: (davinciCode: DavinciCode) => void
): Unsubscribe => {
  console.log(loungeId);
  const reference = fRefrence(database);
  const davinciCodeReference = child(
    child(reference, DAVINCI_CODE_REFERENCE),
    loungeId
  );
  return onValue(davinciCodeReference, (snapshot) => {
    const data = snapshot.val() as DavinciCode;
    onChanged(data);
  });
};
