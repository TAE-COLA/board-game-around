import { Lounge } from 'entities';
import { database } from 'features';
import { ref as fRefrence, set } from 'firebase/database';

const LOUNGE_REFERENCE = 'Lounge/';

export const createLounge = async (lounge: Lounge): Promise<string> => {
  const reference = fRefrence(database, LOUNGE_REFERENCE + lounge.id);
  set(reference, lounge);

  return lounge.id;
};