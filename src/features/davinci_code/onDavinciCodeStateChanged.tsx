import { DavinciCode } from 'entities';
import { database } from 'features';
import { child, onValue, ref, type Unsubscribe } from 'firebase/database';
import { sanitize } from 'shared';

const DAVINCI_CODE_REFERENCE = 'DavinciCode';

export const onDavinciCodeStateChanged = (
  loungeId: string,
  onChanged: (davinciCode: DavinciCode) => void
): Unsubscribe => {
  const reference = ref(database);
  const davinciCodeReference = child(
    child(reference, DAVINCI_CODE_REFERENCE),
    loungeId
  );
  return onValue(davinciCodeReference, (snapshot) => {
    const data = snapshot.val() as DavinciCode;

    const sanitizedData = sanitize(data);
    if (!sanitizedData) {
      throw new Error('Invalid data');
    }
    onChanged(sanitizedData);
  });
};
