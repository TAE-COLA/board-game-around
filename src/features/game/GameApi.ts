import * as fs from 'firebase/firestore';
import { Game, GAME } from 'models';
import { CommonError, sanitize } from 'shared';
import { firestore } from '../firebase_config';

const collection = fs.collection(firestore, GAME.collection);

/**
 *
 * @returns Promise<Game[]>
 *
 * 모든 게임 목록을 가져옵니다.
 */
export const fetchAll = async () => {
  const snapshots = await fs.getDocs(collection);
  const data = snapshots.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Game));

  return sanitize(data, () => {
    throw new Error(CommonError.NO_GAME);
  }).val();
};

/**
 *
 * @param id Game ID
 * @returns Promise<Game>
 *
 * Game ID로 게임을 가져옵니다.
 */
export const fetchById = async (id: string): Promise<Game> => {
  const document = fs.doc(collection, id);
  const snapshot = await fs.getDoc(document);
  const data = { id: snapshot.id, ...snapshot.data() } as Game;

  return sanitize(data, () => {
    throw new Error(CommonError.NO_GAME);
  }).val();
};
