import * as db from 'firebase/database';
import { FModel } from 'models';
import { CommonError, GameName, generateCode, initialUpdates, placeholder } from 'shared';
import { getRef } from '../../firebase.util';
import { database } from '../../firebase_config';
import { fetchById as fetchGameById } from '../../game/api/game.api';
import { LOUNGE, Lounge, USER_LOUNGE, UserLounge } from '../model';

const reference = db.ref(database);

const loungeReference = db.child(reference, LOUNGE.reference);
const userLoungeReference = db.child(reference, USER_LOUNGE.reference);

const findFirstChild = (snapshot: db.DataSnapshot): db.DataSnapshot => {
  let firstChild: db.DataSnapshot | null = null;

  snapshot.forEach((child) => {
    firstChild = child;
    return true;
  });

  if (!firstChild) throw new Error(CommonError.NO_LOUNGE);
  return firstChild;
};

const isSameGame = async (gameId: string, loungeGameId: string) => {
  if (gameId === loungeGameId) return true;

  const [selectedGame, loungeGame] = await Promise.all([
    fetchGameById(gameId),
    fetchGameById(loungeGameId),
  ]);

  return selectedGame.name === loungeGame.name;
};

/**
 *
 * @param gameId Game ID
 * @param ownerId 방장 ID
 * @returns 생성된 Lounge ID
 *
 * Lounge를 생성합니다.
 */
export const create = async (gameId: string, ownerId: string): Promise<string> => {
  const loungeId = db.push(loungeReference).key!;

  let code = '';
  let isUnique = false;
  while (!isUnique) {
    code = generateCode(10);
    const query = db.query(loungeReference, db.orderByChild(LOUNGE.code), db.equalTo(code));
    const snapshot = await db.get(query);
    isUnique = !snapshot.exists();
  }

  // // Add dummy players
  // const dummyPlayers = [
  //   '0stLzmhQtyc30FIeGii7047uvFv1',
  //   'CiB1YRBhNVQSW7grv1yOGcGr0wA3',
  //   'XICkS14iXqU53eYZDr1OlvQeFdA3',
  // ];
  const playerIds = [ownerId];

  const lounge = {
    gameId,
    code,
    ownerId,
    playerIds,
    status: 'WAITING',
    createdAt: db.serverTimestamp(),
    deletedAt: placeholder,
  };

  const updates = initialUpdates();

  updates[`/${LOUNGE.reference}/${loungeId}`] = lounge;
  updates[`/${USER_LOUNGE.reference}/${ownerId}/${USER_LOUNGE.loungeId}`] = loungeId;

  await db.update(reference, updates);

  return loungeId;
};

/**
 *
 * @param code Lounge 코드
 * @param gameId Game ID
 * @param userId 사용자 ID
 * @returns 생성된 Lounge ID
 *
 * Lounge에 참가합니다.
 */
export const join = async (
  code: string,
  gameId: string,
  userId: string
): Promise<string | null> => {
  const query = db.query(loungeReference, db.orderByChild(LOUNGE.code), db.equalTo(code));
  const loungeSnapshot = await getRef(query, () => {
    throw new Error(CommonError.NO_LOUNGE);
  });
  const lounge = new FModel<Lounge>(findFirstChild(loungeSnapshot)).sanitize();

  if (!(await isSameGame(gameId, lounge.gameId))) throw new Error(CommonError.NOT_THIS_GAME);
  if (lounge.status !== 'WAITING') throw new Error(CommonError.NO_LOUNGE);

  const playerIds = lounge.playerIds.includes(userId)
    ? lounge.playerIds
    : [...lounge.playerIds, userId];
  const selectedGame = await fetchGameById(gameId);
  if (GameName.isTheMind(selectedGame.name) && playerIds.length > 4) {
    throw new Error(CommonError.NO_LOUNGE);
  }

  const updates = {
    [`/${LOUNGE.reference}/${lounge.id}/${LOUNGE.playerIds}`]: playerIds,
    [`/${USER_LOUNGE.reference}/${userId}/${USER_LOUNGE.loungeId}`]: lounge.id,
  };

  await db.update(reference, updates);

  return lounge.id;
};

/**
 *
 * @param id Lounge ID
 * @returns Promise<Lounge>
 *
 * Lounge ID로 Lounge를 가져옵니다.
 */
export const fetchById = async (id: string): Promise<Lounge> => {
  const loungeSnapshot = await getRef(db.child(loungeReference, id), () => {
    throw new Error(CommonError.NO_LOUNGE);
  });
  const lounge = new FModel<Lounge>(loungeSnapshot).sanitize();

  return lounge;
};

/**
 *
 * @param id User ID
 * @returns Promise<string>
 *
 * User ID로 Lounge ID를 가져옵니다.
 */
export const fetchByUserId = async (id: string): Promise<string> => {
  const userLoungeSnapshot = await getRef(db.child(userLoungeReference, id), () => {
    throw new Error(CommonError.NO_USER_LOUNGE);
  });
  const userLounge = new FModel<UserLounge>(userLoungeSnapshot).sanitize();

  return userLounge.loungeId;
};

/**
 *
 * @param id Lounge ID
 * @param onChanged Callback function
 * @returns db.Unsubscribe
 *
 * Lounge의 상태가 변경되었을 때 호출됩니다.
 */
export const onStateChanged = (
  id: string,
  onChanged: (lounge?: Lounge) => void
): db.Unsubscribe => {
  return db.onValue(db.child(loungeReference, id), (snapshot) => {
    if (!snapshot.exists()) throw new Error(CommonError.LOUNGE_STATE_FAILED);
    const lounge = new FModel<Lounge>(snapshot).sanitize();

    if (lounge.deletedAt) onChanged(undefined);
    else onChanged(lounge);
  });
};

/**
 *
 * @param loungeId Lounge ID
 * @param userId User ID
 * @returns Promise<void>
 *
 * Lounge에서 나갑니다.
 */
export const exit = async (loungeId: string, userId: string): Promise<void> => {
  const loungeSnapshot = await getRef(db.child(loungeReference, loungeId), () => {
    throw new Error(CommonError.NO_LOUNGE);
  });
  const lounge = new FModel<Lounge>(loungeSnapshot).sanitize();

  const filteredPlayerIds = lounge.playerIds.filter((id) => id !== userId);

  const updates = initialUpdates();

  updates[`/${LOUNGE.reference}/${loungeId}/${LOUNGE.ownerId}`] =
    filteredPlayerIds.length === 0 ? null : filteredPlayerIds[0];
  updates[`/${LOUNGE.reference}/${loungeId}/${LOUNGE.playerIds}`] = filteredPlayerIds;
  updates[`/${LOUNGE.reference}/${loungeId}/${LOUNGE.deletedAt}`] =
    filteredPlayerIds.length === 0 ? db.serverTimestamp() : null;
  updates[`/${USER_LOUNGE.reference}/${userId}`] = null;

  await db.update(reference, updates);
};
