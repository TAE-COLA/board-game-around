import * as db from 'firebase/database';
import * as fs from 'firebase/firestore';
import { CommonError } from 'shared';

export const getRef = async (query: db.Query, onError?: () => void): Promise<db.DataSnapshot> => {
  const snapshot = await db.get(query);
  if (!snapshot.exists()) {
    if (onError) onError();
    else throw new Error(CommonError.NO_DATA);
  }
  return snapshot;
};

export const getDocs = async (query: fs.Query, onError?: () => void): Promise<fs.QuerySnapshot> => {
  const snapshot = await fs.getDocs(query);
  if (snapshot.empty) {
    if (onError) onError();
    else throw new Error(CommonError.NO_DATA);
  }
  return snapshot;
};

export const getDoc = async (
  document: fs.DocumentReference,
  onError?: () => void
): Promise<fs.DocumentSnapshot> => {
  const snapshot = await fs.getDoc(document);
  if (!snapshot.exists()) {
    if (onError) onError();
    else throw new Error(CommonError.NO_DATA);
  }
  return snapshot;
};
