import * as fs from 'firebase/firestore';
import { Game, GAME } from 'models';
import { CommonError, GameName } from 'shared';
import { getDoc, getDocs } from '../firebase.util';
import { firestore } from '../firebase_config';

const collection = fs.collection(firestore, GAME.collection);

const localGames: Game[] = [
  {
    id: 'the-mind',
    name: GameName.TheMind.korean,
    description:
      'Play numbered cards from 1 to 100 in ascending order without table talk.',
    image: '',
  },
];

/**
 *
 * @returns Promise<Game[]>
 *
 * 모든 게임 목록을 가져옵니다.
 */
export const fetchAll = async () => {
  let games: Game[] = [];

  try {
    const snapshots = await getDocs(collection, () => {
      throw new Error(CommonError.NO_GAME);
    });
    games = snapshots.docs.map((snapshot) => ({ id: snapshot.id, ...snapshot.data() } as Game));
  } catch {
    games = [];
  }

  return localGames.reduce((acc, game) => {
    const exists = acc.some((item) => item.id === game.id || item.name === game.name);
    return exists ? acc : [...acc, game];
  }, games);
};

/**
 *
 * @param id Game ID
 * @returns Promise<Game>
 *
 * Game ID로 게임을 가져옵니다.
 */
export const fetchById = async (id: string): Promise<Game> => {
  const localGame = localGames.find((game) => game.id === id);
  if (localGame) return localGame;

  const document = fs.doc(collection, id);
  const snapshot = await getDoc(document, () => {
    throw new Error(CommonError.NO_GAME);
  });
  const game = { id: snapshot.id, ...snapshot.data() } as Game;

  return game;
};
