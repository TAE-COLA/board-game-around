import { User } from 'entities';
import { firestore } from 'features';
import { addDoc, collection as fCollection } from 'firebase/firestore';

const USER_COLLECTION = 'Users';

const createUser = async (user: User): Promise<string> => {
  const collection = fCollection(firestore, USER_COLLECTION);
  const documents = await addDoc(collection, user);
  
  return documents.id;
};

export default createUser;