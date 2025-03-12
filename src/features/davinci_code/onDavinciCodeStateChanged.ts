import { database } from 'features';
import { child, onValue, ref, type Unsubscribe } from 'firebase/database';
import { DavinciCode } from 'models';
import { CommonError, sanitize } from 'shared';

const DAVINCI_CODE_REFERENCE = 'DavinciCode';

export const onDavinciCodeStateChanged = (
  loungeId: string,
  onChanged: (davinciCode: DavinciCode) => void
): Unsubscribe => {
  const reference = ref(database);
  const davinciCodeReference = child(child(reference, DAVINCI_CODE_REFERENCE), loungeId);
  return onValue(davinciCodeReference, (snapshot) => {
    const data = snapshot.val() as DavinciCode;
    onChanged(
      sanitize(data, () => {
        throw new Error(CommonError.GAME_STATE_FAILED);
      }).val()
    );
  });
};
