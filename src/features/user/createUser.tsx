import { User } from 'entities';
import { firestore } from 'features';
import { doc as fDocument, setDoc } from 'firebase/firestore';

const USER_COLLECTION = 'Users';

const createUser = async (user: User): Promise<string> => {
  const document = fDocument(firestore, USER_COLLECTION, user.id);
  await setDoc(document, user);
  
  return user.id;
};

export default createUser;