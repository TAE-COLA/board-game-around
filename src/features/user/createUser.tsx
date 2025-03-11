import { firestore } from 'features';
import { doc as fDocument, setDoc } from 'firebase/firestore';
import { User } from 'models';

const USER_COLLECTION = 'Users';

export const createUser = async (user: User): Promise<string> => {
  const document = fDocument(firestore, USER_COLLECTION, user.id);
  await setDoc(document, user);

  return user.id;
};
