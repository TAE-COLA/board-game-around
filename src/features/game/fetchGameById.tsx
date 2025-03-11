import { firestore } from 'features';
import { collection as fCollection, doc as fDocument, getDoc } from 'firebase/firestore';
import { Game } from 'models';
import { sanitize } from 'shared';

const GAME_COLLECTION = 'Games';

export const fetchGameById = async (id: string): Promise<Game> => {
  const collection = fCollection(firestore, GAME_COLLECTION);
  const document = fDocument(collection, id);
  const snapshot = await getDoc(document);
  const data = { id: snapshot.id, ...snapshot.data() } as Game;

  return sanitize(data, () => {
    throw new Error('Invalid data: data is undefined');
  }).val();
};
