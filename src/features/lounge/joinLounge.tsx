import { Lounge } from 'entities';
import { database } from 'features';
import { child, equalTo, query as fQuery, ref as fRefrence, get, orderByChild, update } from 'firebase/database';

const LOUNGE_REFERENCE = 'Lounge';
const USER_REFERENCE = 'User-lounge';

const LOUNGE_CODE = 'code';
const LOUNGE_PLAYER_IDS = 'playerIds';

const USER_LOUNGE_ID = 'loungeId';

export const joinLounge = async (code: string, gameId: string, userId: string): Promise<string | null> => {
  const reference = fRefrence(database);
  const query = fQuery(child(reference, LOUNGE_REFERENCE), orderByChild(LOUNGE_CODE), equalTo(code));
  const snapshot = await get(query)
  const data = snapshot.val();

  const loungeId = Object.keys(data)[0];
  const lounge: Lounge = data[loungeId]

  if (lounge.gameId !== gameId) {
    throw new Error('Not this game');
  }

  if (!lounge || !lounge.playerIds || !lounge.ownerId) {
    throw new Error('Invalid Lounge');
  }

  const updates = {
    [`/${LOUNGE_REFERENCE}/${loungeId}/${LOUNGE_PLAYER_IDS}`]: [...lounge.playerIds, userId],
    [`/${USER_REFERENCE}/${userId}/${USER_LOUNGE_ID}`]: loungeId
  };

  await update(reference, updates);

  return loungeId;
};