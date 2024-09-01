import { User } from 'entities';
import { firestore } from 'features';
import { collection as fCollection, doc as fDocument, getDoc } from 'firebase/firestore';

const USER_COLLECTION = 'Users';

export const fetchUserById = async (id: string): Promise<User> => {
  const collection = fCollection(firestore, USER_COLLECTION);
  const document = fDocument(collection, id);
  const snapshot = await getDoc(document);
  const data = snapshot.data();
  
  return data as User;
};