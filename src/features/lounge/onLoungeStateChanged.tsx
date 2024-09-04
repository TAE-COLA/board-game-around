import { Lounge } from 'entities';
import { database } from 'features';
import { child, ref as fRefrence, onValue, type Unsubscribe } from 'firebase/database';

const LOUNGE_REFERENCE = 'Lounge';

export const onLoungeStateChanged = (id: string, onChanged: (lounge: Lounge) => void): Unsubscribe => {
  const reference = child(fRefrence(database), LOUNGE_REFERENCE);
  const loungeReference = child(reference, id);
  return onValue(loungeReference, (snapshot) => {
    const data = { id: snapshot.key, ...snapshot.val() };
    onChanged(data);
  });
};