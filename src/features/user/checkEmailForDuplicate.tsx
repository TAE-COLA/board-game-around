import { firestore } from 'features';
import { collection as fCollection, query as fQuery, getDocs, where } from 'firebase/firestore';

const USER_COLLECTION = 'Users';

const USER_NAME = 'name';
const USER_EMAIL = 'email';
const USER_CREATED_AT = 'createdAt';

const checkEmailForDuplicate = async (email: string): Promise<boolean> => {
  const collection = fCollection(firestore, USER_COLLECTION);
  const query = fQuery(collection, where(USER_EMAIL, '==', email));
  const documents = await getDocs(query);
  
  return documents.size > 0;
};

export default checkEmailForDuplicate;