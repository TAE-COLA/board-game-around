import { Lounge } from 'entities';
import { database } from 'features';
import { ref as fRefrence, onValue } from 'firebase/database';

const LOUNGE_REFERENCE = 'Lounge/';

export const fetchLoungeById = async (id: string, setData: (data: Lounge) => void) => {
  const reference = fRefrence(database, LOUNGE_REFERENCE + id);
  onValue(reference, (snapshot) => {
    const data = snapshot.val();
    setData(data);
  });
};