import * as fa from 'firebase/auth';
import * as fs from 'firebase/firestore';
import { USER, User } from '../model';
import { CommonError } from 'shared';
import { getDoc } from '../../firebase.util';
import { firestore } from '../../firebase_config';

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

export const login = async (email: string, password: string): Promise<void> => {
  const auth = fa.getAuth();

  await fa.signInWithEmailAndPassword(auth, email, password);
};

export const logout = async (): Promise<void> => {
  const auth = fa.getAuth();

  await fa.signOut(auth);
};

export const checkForEmailDuplicates = async (email: string): Promise<boolean> => {
  const query = fs.query(collection, fs.where(USER.email, '==', email));
  const snapshot = await fs.getDocs(query);

  return !snapshot.empty;
};

export const hasSession = (): boolean => {
  const auth = fa.getAuth();

  return !!auth.currentUser;
};

export const fetchById = async (id: string): Promise<User> => {
  const document = fs.doc(collection, id);
  const snapshot = await getDoc(document, () => {
    throw new Error(CommonError.NO_USER);
  });
  const user = { id: snapshot.id, ...snapshot.data() } as User;

  return user;
};
