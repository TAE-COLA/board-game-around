import { firestore } from 'features';
import { collection as fCollection, doc as fDocument, getDoc } from 'firebase/firestore';
import { User } from 'models';
import { sanitize } from 'shared';

const USER_COLLECTION = 'Users';

export const fetchUserById = async (id: string): Promise<User> => {
  const collection = fCollection(firestore, USER_COLLECTION);
  const document = fDocument(collection, id);
  const snapshot = await getDoc(document);
  const data = snapshot.data() as User;

  const sanitizedData = sanitize(data);
  if (!sanitizedData) {
    throw new Error('Invalid data');
  }
  return sanitizedData;
};
