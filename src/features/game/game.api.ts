import * as fs from 'firebase/firestore';
import { Game, GAME } from 'models';
import { CommonError } from 'shared';
import { getDoc, getDocs } from '../firebase.util';
import { firestore } from '../firebase_config';

const collection = fs.collection(firestore, GAME.collection);

/**
 *
 * @returns Promise<Game[]>
 *
 * 모든 게임 목록을 가져옵니다.
 */
export const fetchAll = async () => {
  const snapshots = await getDocs(collection, () => {
    throw new Error(CommonError.NO_GAME);
  });
  const games = snapshots.docs.map((snapshot) => ({ id: snapshot.id, ...snapshot.data() } as Game));

  return games;
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
  const snapshot = await getDoc(document, () => {
    throw new Error(CommonError.NO_GAME);
  });
  const game = { id: snapshot.id, ...snapshot.data() } as Game;

  return game;
};
