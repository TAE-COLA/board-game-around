import { Lounge } from 'entities';
import { database } from 'features';
import { child, ref as fRefrence, onValue } from 'firebase/database';

const LOUNGE_REFERENCE = 'Lounge';

export const fetchLoungeById = (id: string, setData: (data: Lounge) => void, onCrash: () => void) => {
  const reference = fRefrence(database);
  const loungeReference = child(reference, LOUNGE_REFERENCE);
  const unsubscribe = onValue(child(loungeReference, id), (snapshot) => {
    const data = { id: snapshot.key, ...snapshot.val() };
    if (!data || !data.ownerId || !data.memberIds) {
      unsubscribe();
      onCrash();
    } else {
      setData(data);
    }
  });
};