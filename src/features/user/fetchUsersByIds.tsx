import { firestore } from 'features';
import { collection as fCollection, query as fQuery, getDocs, where } from 'firebase/firestore';
import { User } from 'models';
import { sanitize } from 'shared';

const USER_COLLECTION = 'Users';

export const fetchUsersByIds = async (ids: string[]): Promise<User[]> => {
  const collection = fCollection(firestore, USER_COLLECTION);
  const query = fQuery(collection, where('__name__', 'in', ids));
  const snapshots = await getDocs(query);
  const data = snapshots.docs.map((doc) => doc.data() as User);

  const sanitizedData = sanitize(data);
  if (!sanitizedData) {
    throw new Error('Invalid data');
  }
  return sanitizedData;
};
