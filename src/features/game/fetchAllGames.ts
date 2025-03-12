import { firestore } from 'features';
import { collection as fCollection, getDocs } from 'firebase/firestore';
import { Game } from 'models';
import { CommonError, sanitize } from 'shared';

const GAME_COLLECTION = 'Games';

export const fetchAllGames = async (): Promise<Game[]> => {
  const collection = fCollection(firestore, GAME_COLLECTION);
  const snapshots = await getDocs(collection);
  const data = snapshots.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Game));

  return sanitize(data, () => {
    throw new Error(CommonError.NO_GAME);
  }).val();
};
