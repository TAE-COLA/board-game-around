import * as fa from 'firebase/auth';
import * as fs from 'firebase/firestore';
import { USER, User } from 'models';
import { CommonError, sanitize } from 'shared';
import { firestore } from '../firebase_config';

const collection = fs.collection(firestore, USER.collection);

export const signUpWithEmailAndPassword = async (
  email: string,
  password: string,
  nickname: string
): Promise<string> => {
  const auth = fa.getAuth();
  const userCredential = await fa.createUserWithEmailAndPassword(auth, email, password);
  const data: fa.User = userCredential.user;

  const user: User = {
    id: data.uid,
    name: nickname,
    email: email,
    createdAt: new Date(),
  };

  const document = fs.doc(collection, user.id);
  await fs.setDoc(document, user);

  return user.id;
};

export const checkForEmailDuplicates = async (email: string): Promise<boolean> => {
  const query = fs.query(collection, fs.where(USER.email, '==', email));
  const snapshot = await fs.getDocs(query);

  return !snapshot.empty;
};

export const fetchById = async (id: string): Promise<User> => {
  const document = fs.doc(collection, id);
  const snapshot = await fs.getDoc(document);
  const data = { id, ...snapshot.data() } as User;

  return sanitize(data, () => {
    throw new Error(CommonError.NO_USER);
  }).val();
};
