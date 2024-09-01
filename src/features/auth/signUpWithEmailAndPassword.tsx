import { User } from 'entities';
import { createUser } from 'features';
import { createUserWithEmailAndPassword, User as FUser, getAuth } from 'firebase/auth';

const signUpWithEmailAndPassword = async (email: string, password: string, nickname: string): Promise<string> => {
  const auth = getAuth();
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);

  const data: FUser = userCredential.user;
  const user: User = { id: data.uid, name: nickname, email: email, createdAt: new Date() }
  const userId = await createUser(user);

  return userId;
};

export default signUpWithEmailAndPassword;