import * as db from 'firebase/database';
import { FModel, LOUNGE, Lounge, USER_LOUNGE, UserLounge } from 'models';
import { CommonError, generateCode, initialUpdates, placeholder } from 'shared';
import { getRef } from '../firebase.util';
import { database } from '../firebase_config';

const reference = db.ref(database);

const loungeReference = db.child(reference, LOUNGE.reference);
const userLoungeReference = db.child(reference, USER_LOUNGE.reference);

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
  const lounge = new FModel<Lounge>(loungeSnapshot).sanitize();

  if (gameId !== lounge.gameId) throw new Error(CommonError.NOT_THIS_GAME);

  const updates = {
    [`/${LOUNGE.reference}/${lounge.id}/${LOUNGE.playerIds}`]: [...lounge.playerIds, userId],
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
