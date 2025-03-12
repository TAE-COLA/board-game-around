import { firestore } from 'features';
import { collection as fCollection, doc as fDocument, getDoc } from 'firebase/firestore';
import { User } from 'models';
import { errorNoUser, sanitize } from 'shared';

const USER_COLLECTION = 'Users';

export const fetchUserById = async (id: string): Promise<User> => {
  const collection = fCollection(firestore, USER_COLLECTION);
  const document = fDocument(collection, id);
  const snapshot = await getDoc(document);
  const data = snapshot.data() as User;

  return sanitize(data, () => {
    throw new Error(errorNoUser);
  }).val();
};
