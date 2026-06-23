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

const userLoungeByUserReference = (userId: string) => db.child(userLoungeReference, userId);
const loungeByIdReference = (loungeId: string) => db.child(loungeReference, loungeId);

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

const fetchActiveLoungeIdByUserId = async (userId: string): Promise<string | null> => {
  const userLoungeSnapshot = await db.get(userLoungeByUserReference(userId));
  if (!userLoungeSnapshot.exists()) return null;

  const userLounge = new FModel<UserLounge>(userLoungeSnapshot).sanitize();
  if (!userLounge.loungeId) return null;

  const loungeSnapshot = await db.get(loungeByIdReference(userLounge.loungeId));
  if (!loungeSnapshot.exists()) {
    await db.set(userLoungeByUserReference(userId), null);
    return null;
  }

  const lounge = new FModel<Lounge>(loungeSnapshot).sanitize();
  if (lounge.deletedAt) {
    await db.set(userLoungeByUserReference(userId), null);
    return null;
  }

  return userLounge.loungeId;
};

const deleteLounge = async (loungeId: string): Promise<void> => {
  await db.update(reference, {
    [`/${LOUNGE.reference}/${loungeId}/${LOUNGE.deletedAt}`]: db.serverTimestamp(),
  });
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
  const activeLoungeId = await fetchActiveLoungeIdByUserId(ownerId);
  if (activeLoungeId) return activeLoungeId;

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
  await db.update(reference, updates);

  const claimResult = await db.runTransaction(userLoungeByUserReference(ownerId), (current) => {
    if (current?.[USER_LOUNGE.loungeId]) return current;
    return { [USER_LOUNGE.loungeId]: loungeId };
  });

  const claimedLoungeId = claimResult.snapshot.val()?.[USER_LOUNGE.loungeId];
  if (claimedLoungeId !== loungeId) {
    await deleteLounge(loungeId);
    return claimedLoungeId;
  }

  return claimedLoungeId;
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
  const activeLoungeId = await fetchActiveLoungeIdByUserId(userId);
  if (activeLoungeId) return activeLoungeId;

  const query = db.query(loungeReference, db.orderByChild(LOUNGE.code), db.equalTo(code));
  const loungeSnapshot = await getRef(query, () => {
    throw new Error(CommonError.NO_LOUNGE);
  });
  const lounge = new FModel<Lounge>(findFirstChild(loungeSnapshot)).sanitize();

  if (!(await isSameGame(gameId, lounge.gameId))) throw new Error(CommonError.NOT_THIS_GAME);
  if (lounge.status !== 'WAITING') throw new Error(CommonError.NO_LOUNGE);

  const selectedGame = await fetchGameById(gameId);

  const claimResult = await db.runTransaction(userLoungeByUserReference(userId), (current) => {
    if (current?.[USER_LOUNGE.loungeId]) return current;
    return { [USER_LOUNGE.loungeId]: lounge.id };
  });

  const claimedLoungeId = claimResult.snapshot.val()?.[USER_LOUNGE.loungeId];
  if (claimedLoungeId !== lounge.id) return claimedLoungeId;

  let rejected = false;
  const joinResult = await db.runTransaction(loungeByIdReference(lounge.id), (current) => {
    if (!current || current[LOUNGE.status] !== 'WAITING' || current[LOUNGE.deletedAt]) {
      rejected = true;
      return;
    }

    const currentPlayerIds: string[] = current[LOUNGE.playerIds] ?? [];
    const nextPlayerIds = currentPlayerIds.includes(userId)
      ? currentPlayerIds
      : [...currentPlayerIds, userId];

    if (GameName.isTheMind(selectedGame.name) && nextPlayerIds.length > 4) {
      rejected = true;
      return;
    }

    return { ...current, [LOUNGE.playerIds]: nextPlayerIds };
  });

  if (!joinResult.committed || rejected) {
    await db.set(userLoungeByUserReference(userId), null);
    throw new Error(CommonError.NO_LOUNGE);
  }

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
  const loungeSnapshot = await getRef(loungeByIdReference(id), () => {
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
  const activeLoungeId = await fetchActiveLoungeIdByUserId(id);
  if (!activeLoungeId) throw new Error(CommonError.NO_USER_LOUNGE);
  return activeLoungeId;
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
  return db.onValue(loungeByIdReference(id), (snapshot) => {
    if (!snapshot.exists()) {
      onChanged(undefined);
      return;
    }

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
  const loungeSnapshot = await getRef(loungeByIdReference(loungeId), () => {
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
