import { database } from 'features';
import { child, ref as fRefrence, onValue, type Unsubscribe } from 'firebase/database';
import { Lounge } from 'models';

const REFERENCE_LOUNGE = 'Lounge';

export const onLoungeStateChanged = (id: string, onChanged: (lounge?: Lounge) => void): Unsubscribe => {
  const reference = child(fRefrence(database), REFERENCE_LOUNGE);
  const loungeReference = child(reference, id);

  return onValue(loungeReference, (snapshot) => {
    const data = { id: snapshot.key, ...snapshot.val() };
    if (data.deletedAt) onChanged(undefined);
    else onChanged(data);
  });
};
