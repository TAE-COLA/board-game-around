import { User } from 'entities';
import { firestore } from 'features';
import { collection as fCollection, query as fQuery, getDocs, where } from 'firebase/firestore';

const USER_COLLECTION = 'Users';

export const fetchUsersByIds = async (ids: string[]): Promise<User[]> => {
  const collection = fCollection(firestore, USER_COLLECTION);
  const query = fQuery(collection, where('__name__', 'in', ids));
  const snapshots = await getDocs(query);
  const data = snapshots.docs.map(doc => doc.data() as User);
  
  return data;
};