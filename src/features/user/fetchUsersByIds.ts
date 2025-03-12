import { firestore } from 'features';
import { collection as fCollection, query as fQuery, getDocs, where } from 'firebase/firestore';
import { User } from 'models';
import { CommonError, sanitize } from 'shared';

const USER_COLLECTION = 'Users';

export const fetchUsersByIds = async (ids: string[]): Promise<User[]> => {
  if (ids.length === 0) return [];

  const collection = fCollection(firestore, USER_COLLECTION);
  const query = fQuery(collection, where('__name__', 'in', ids));
  const snapshots = await getDocs(query);
  const data = snapshots.docs.map((doc) => doc.data() as User);

  return sanitize(data, () => {
    throw new Error(CommonError.NO_USER);
  }).val();
};
