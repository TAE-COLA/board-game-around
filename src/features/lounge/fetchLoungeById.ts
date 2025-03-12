import { database } from 'features';
import { child, ref as fRefrence, onValue } from 'firebase/database';
import { Lounge } from 'models';
import { sanitize } from 'shared';

const LOUNGE_REFERENCE = 'Lounge';

export const fetchLoungeById = (id: string, setData: (data: Lounge) => void, onCrash: () => void) => {
  const reference = fRefrence(database);
  const loungeReference = child(reference, LOUNGE_REFERENCE);
  const unsubscribe = onValue(child(loungeReference, id), (snapshot) => {
    const data = { id: snapshot.key, ...snapshot.val() } as Lounge;
    const lounge = sanitize(data, () => {
      unsubscribe();
      onCrash();
    }).val();

    if (!lounge || !lounge.ownerId || !lounge.playerIds) {
      unsubscribe();
      onCrash();
    } else {
      setData(lounge);
    }
  });
};
