import { database } from 'features';
import { child, equalTo, query as fQuery, ref as fReference, get, orderByChild, push, serverTimestamp, update } from 'firebase/database';
import { generateCode } from 'shared';

const LOUNGE_REFERENCE = 'Lounge';
const USER_REFERENCE = 'User-lounge';

const LOUNGE_CODE = 'code';
const LOUNGE_MEMBER_IDS = 'memberIds';

const USER_LOUNGE_ID = 'loungeId';

export const createLounge = async (gameId: string, ownerId: string): Promise<string> => {
  const reference = fReference(database);
  
  const loungeId = push(child(reference, LOUNGE_REFERENCE)).key!;
  let code: string = '';

  let isUnique = false;
  while (!isUnique) {
    code = generateCode(10);
    const query = fQuery(child(reference, LOUNGE_REFERENCE), orderByChild(LOUNGE_CODE), equalTo(code));
    const snapshot = await get(query);
    isUnique = !snapshot.exists();
  }

  const lounge = {
    gameId,
    code,
    ownerId,
    memberIds: [ownerId],
    createdAt: serverTimestamp()
  }

  const updates = {
    [`/${LOUNGE_REFERENCE}/${loungeId}`]: lounge,
    [`/${USER_REFERENCE}/${ownerId}/${USER_LOUNGE_ID}`]: loungeId
  };

  await update(reference, updates);

  return loungeId;
};