import { Lounge } from 'entities';
import { database } from 'features';
import { child, ref as fRefrence, get, serverTimestamp, update } from 'firebase/database';

const LOUNGE_REFERENCE = 'Lounge';
const USER_REFERENCE = 'User-lounge';

const LOUNGE_OWNER_ID = 'ownerId';
const LOUNGE_PLAYER_IDS = 'playerIds';
const LOUNGE_DELETED_AT = 'deletedAt';

export const exitLounge = async (loungeId: string, userId: string): Promise<void> => {
  const reference = fRefrence(database);
  const loungeReference = child(child(reference, LOUNGE_REFERENCE), loungeId);
  const lounge = (await get(loungeReference)).val() as Lounge;

  if (!lounge || !lounge.playerIds || !lounge.ownerId) {
    return;
  }

  const filteredPlayerIds = lounge.playerIds.filter((id: string) => id !== userId);
  const updates = {
    [`/${LOUNGE_REFERENCE}/${loungeId}/${LOUNGE_OWNER_ID}`]: filteredPlayerIds.length === 0 ? null : filteredPlayerIds[0],
    [`/${LOUNGE_REFERENCE}/${loungeId}/${LOUNGE_PLAYER_IDS}`]: filteredPlayerIds,
    [`/${LOUNGE_REFERENCE}/${loungeId}/${LOUNGE_DELETED_AT}`]: filteredPlayerIds.length === 0 ? serverTimestamp() : null,
    [`/${USER_REFERENCE}/${userId}`]: null
  };

  await update(reference, updates);
};