import * as FirebaseAuth from 'firebase/auth';
import { User } from 'models';
import { createUser } from '../user';

export const signUpWithEmailAndPassword = async (
  email: string,
  password: string,
  nickname: string
): Promise<string> => {
  const auth = FirebaseAuth.getAuth();
  const userCredential = await FirebaseAuth.createUserWithEmailAndPassword(auth, email, password);
  const data: FirebaseAuth.User = userCredential.user;

  const user: User = {
    id: data.uid,
    name: nickname,
    email: email,
    createdAt: new Date(),
  };
  const userId = await createUser(user);

  return userId;
};
