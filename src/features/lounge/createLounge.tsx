import { database } from 'features';
import { child, equalTo, query as fQuery, ref as fReference, get, orderByChild, serverTimestamp, set } from 'firebase/database';
import { generateCode } from 'shared';
import { v4 as uuidv4 } from 'uuid';

const LOUNGE_REFERENCE = 'Lounge';

const LOUNGE_CODE = 'code';
const LOUNGE_MEMBER_IDS = 'memberIds';

export const createLounge = async (gameId: string, ownerId: string): Promise<string> => {
  const reference = child(fReference(database), LOUNGE_REFERENCE);

  const loungeId = uuidv4();
  let code: string = '';

  let isUnique = false;
  while (!isUnique) {
    code = generateCode(10);
    const query = fQuery(reference, orderByChild(LOUNGE_CODE), equalTo(code));
    const snapshot = await get(query);
    isUnique = !snapshot.exists();
  }

  const lounge = {
    gameId,
    code,
    ownerId,
    createdAt: serverTimestamp()
  }

  const loungeReference = child(reference, loungeId);
  await set(loungeReference, lounge);

  const memberReference = child(child(loungeReference, LOUNGE_MEMBER_IDS), ownerId);
  await set(memberReference, true);

  return loungeId;
};