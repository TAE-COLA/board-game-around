import * as fs from 'firebase/firestore';
import { Game, GAME } from '../model';
import { CommonError, GameName } from 'shared';
import { getDoc, getDocs } from '../../firebase.util';
import { firestore } from '../../firebase_config';

const collection = fs.collection(firestore, GAME.collection);

const isTheMindGame = (game: Game) => game.id === 'the-mind' || GameName.isTheMind(game.name);

const normalizeGame = (game: Game): Game =>
  isTheMindGame(game) ? { ...game, name: GameName.TheMind.korean } : game;

const dedupeGames = (games: Game[]) =>
  games.reduce<Game[]>((acc, game) => {
    const exists = acc.some((item) =>
      isTheMindGame(item) && isTheMindGame(game)
        ? true
        : item.id === game.id || item.name === game.name
    );

    return exists ? acc : [...acc, game];
  }, []);

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
    games = dedupeGames(
      snapshots.docs.map((snapshot) => normalizeGame({ id: snapshot.id, ...snapshot.data() } as Game))
    );
  } catch {
    games = [];
  }

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

  return normalizeGame(game);
};
