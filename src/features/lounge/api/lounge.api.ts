import * as db from 'firebase/database';
import { FModel } from 'models';
import {
  CommonError,
  GameName,
  generateCode,
  initialUpdates,
  isPlaceholder,
  placeholder,
} from 'shared';
import { getRef } from '../../firebase.util';
import { database } from '../../firebase_config';
import { fetchById as fetchGameById } from '../../game/api/game.api';
import { LOUNGE, Lounge, USER_LOUNGE, UserLounge } from '../model';

const reference = db.ref(database);

const loungeReference = db.child(reference, LOUNGE.reference);
const userLoungeReference = db.child(reference, USER_LOUNGE.reference);

const userLoungeByUserReference = (userId: string) => db.child(userLoungeReference, userId);
const loungeByIdReference = (loungeId: string) => db.child(loungeReference, loungeId);

type StoredLounge = Partial<Lounge> & {
  id?: string;
  memberIds?: Record<string, boolean>;
};

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

const isDeletedAtSet = (deletedAt: unknown) => !!deletedAt && !isPlaceholder(deletedAt);

const getPlayerIds = (lounge: StoredLounge) => {
  if (Array.isArray(lounge.playerIds)) return lounge.playerIds;
  if (lounge.memberIds) return Object.keys(lounge.memberIds).filter((id) => lounge.memberIds?.[id]);
  return [];
};

const normalizeLounge = (lounge: StoredLounge): Lounge => ({
  ...lounge,
  gameId: lounge.gameId ?? '',
  code: lounge.code ?? '',
  ownerId: lounge.ownerId ?? '',
  playerIds: getPlayerIds(lounge),
  status: lounge.status ?? 'WAITING',
  createdAt: lounge.createdAt ?? new Date(0),
});

const sanitizeLounge = (snapshot: db.DataSnapshot) =>
  normalizeLounge(new FModel<StoredLounge>(snapshot).sanitize());

const withoutId = (lounge: Lounge): Omit<Lounge, 'id'> => {
  const { id, ...rest } = lounge;
  return rest;
};

const mergePlayerIds = (current: object | null, lounge: Lounge, userId: string) => {
  const currentData = (current ?? withoutId(lounge)) as StoredLounge;
  const currentLounge = normalizeLounge({ id: lounge.id, ...currentData });
  const currentPlayerIds = getPlayerIds(currentLounge);
  const nextPlayerIds = currentPlayerIds.includes(userId)
    ? currentPlayerIds
    : [...currentPlayerIds, userId];

  return {
    currentLounge,
    nextLounge: {
      ...currentData,
      [LOUNGE.playerIds]: nextPlayerIds,
      [LOUNGE.status]: currentLounge.status,
    },
    nextPlayerIds,
  };
};

const leaveLounge = async (lounge: Lounge, userId: string): Promise<void> => {
  const filteredPlayerIds = lounge.playerIds.filter((id) => id !== userId);

  const updates = initialUpdates();

  updates[`/${LOUNGE.reference}/${lounge.id}/${LOUNGE.ownerId}`] =
    filteredPlayerIds.length === 0 ? null : filteredPlayerIds[0];
  updates[`/${LOUNGE.reference}/${lounge.id}/${LOUNGE.playerIds}`] = filteredPlayerIds;
  updates[`/${LOUNGE.reference}/${lounge.id}/${LOUNGE.deletedAt}`] =
    filteredPlayerIds.length === 0 ? db.serverTimestamp() : null;
  updates[`/${USER_LOUNGE.reference}/${userId}`] = null;

  await db.update(reference, updates);
};

const fetchActiveLoungeByUserId = async (userId: string): Promise<Lounge | null> => {
  const userLoungeSnapshot = await db.get(userLoungeByUserReference(userId));
  if (!userLoungeSnapshot.exists()) return null;

  const userLounge = new FModel<UserLounge>(userLoungeSnapshot).sanitize();
  if (!userLounge.loungeId) return null;

  const loungeSnapshot = await db.get(loungeByIdReference(userLounge.loungeId));
  if (!loungeSnapshot.exists()) {
    await db.set(userLoungeByUserReference(userId), null);
    return null;
  }

  const lounge = sanitizeLounge(loungeSnapshot);
  if (lounge.deletedAt) {
    await db.set(userLoungeByUserReference(userId), null);
    return null;
  }

  return lounge;
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
  const activeLounge = await fetchActiveLoungeByUserId(ownerId);
  if (activeLounge) {
    if (await isSameGame(gameId, activeLounge.gameId)) return activeLounge.id;
    await leaveLounge(activeLounge, ownerId);
  }

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
  _gameId: string,
  userId: string
): Promise<string | null> => {
  const query = db.query(loungeReference, db.orderByChild(LOUNGE.code), db.equalTo(code));
  const loungeSnapshot = await getRef(query, () => {
    throw new Error(CommonError.NO_LOUNGE);
  });
  const lounge = sanitizeLounge(findFirstChild(loungeSnapshot));

  if (lounge.status !== 'WAITING') {
    throw new Error(CommonError.NO_LOUNGE);
  }

  const activeLounge = await fetchActiveLoungeByUserId(userId);
  if (activeLounge) {
    if (activeLounge.id === lounge.id) {
      return activeLounge.id;
    }
    await leaveLounge(activeLounge, userId);
  }

  const loungeGame = await fetchGameById(lounge.gameId);

  const claimResult = await db.runTransaction(userLoungeByUserReference(userId), (current) => {
    if (current?.[USER_LOUNGE.loungeId]) return current;
    return { [USER_LOUNGE.loungeId]: lounge.id };
  });

  const claimedLoungeId = claimResult.snapshot.val()?.[USER_LOUNGE.loungeId];
  if (claimedLoungeId !== lounge.id) {
    return claimedLoungeId;
  }

  let rejected = false;
  const joinResult = await db.runTransaction(loungeByIdReference(lounge.id), (current) => {
    const { currentLounge, nextLounge, nextPlayerIds } = mergePlayerIds(current, lounge, userId);

    if (currentLounge.status !== 'WAITING' || isDeletedAtSet(currentLounge.deletedAt)) {
      rejected = true;
      return;
    }

    if (GameName.isTheMind(loungeGame.name) && nextPlayerIds.length > 4) {
      rejected = true;
      return;
    }

    return nextLounge;
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
  const lounge = sanitizeLounge(loungeSnapshot);

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
  const activeLounge = await fetchActiveLoungeByUserId(id);
  if (!activeLounge) throw new Error(CommonError.NO_USER_LOUNGE);
  return activeLounge.id;
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

    const lounge = sanitizeLounge(snapshot);

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
  const lounge = sanitizeLounge(loungeSnapshot);

  await leaveLounge(lounge, userId);
};
