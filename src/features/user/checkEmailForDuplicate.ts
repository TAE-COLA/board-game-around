import { firestore } from 'features';
import { collection as fCollection, query as fQuery, getDocs, where } from 'firebase/firestore';

const USER_COLLECTION = 'Users';
const USER_EMAIL = 'email';

export const checkEmailForDuplicate = async (email: string): Promise<boolean> => {
  const collection = fCollection(firestore, USER_COLLECTION);
  const query = fQuery(collection, where(USER_EMAIL, '==', email));
  const snapshot = await getDocs(query);

  return !snapshot.empty;
};
