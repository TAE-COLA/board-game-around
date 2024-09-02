import { Game } from 'entities';
import { firestore } from 'features';
import { collection as fCollection, getDocs } from 'firebase/firestore';

const GAME_COLLECTION = 'Games';;

export const fetchAllGames = async (): Promise<Game[]> => {
  const collection = fCollection(firestore, GAME_COLLECTION);
  const snapshots = await getDocs(collection);
  const data = snapshots.docs.map(doc => {
    return {
      id: doc.id,
      name: doc.data().name,
      description: doc.data().description,
      image: doc.data().image,
    }
  });

  return data;
};