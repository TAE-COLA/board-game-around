import { Lounge } from 'entities';
import { database } from 'features';
import { child, equalTo, query as fQuery, ref as fRefrence, get, orderByChild, set } from 'firebase/database';

const LOUNGE_REFERENCE = 'Lounge';

const LOUNGE_CODE = 'code';
const LOUNGE_MEMBER_IDS = 'memberIds';

export const joinLounge = async (code: string, gameId: string, userId: string): Promise<string | null> => {
  const reference = child(fRefrence(database), LOUNGE_REFERENCE);
  const query = fQuery(reference, orderByChild(LOUNGE_CODE), equalTo(code));
  const snapshot = await get(query)
  const data = snapshot.val();

  const loungeId = Object.keys(data)[0];
  const lounge: Lounge = data[loungeId]

  if (lounge.gameId !== gameId) {
    throw new Error('Not this game');
  }

  if (!lounge || !lounge.memberIds || !lounge.ownerId) {
    throw new Error('Invalid Lounge');
  }

  const loungeReference = child(reference, loungeId);
  const memberReference = child(child(loungeReference, LOUNGE_MEMBER_IDS), userId);
  await set(memberReference, true);

  return loungeId;
};