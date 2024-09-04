import { Lounge } from 'entities';
import { database } from 'features';
import { child, ref as fRefrence, get, serverTimestamp, update } from 'firebase/database';

const LOUNGE_REFERENCE = 'Lounge';
const USER_REFERENCE = 'User-lounge';

const LOUNGE_OWNER_ID = 'ownerId';
const LOUNGE_MEMBER_IDS = 'memberIds';
const LOUNGE_DELETED_AT = 'deletedAt';

export const exitLounge = async (loungeId: string, userId: string): Promise<void> => {
  console.log('exitLounge', loungeId, userId);
  const reference = fRefrence(database);
  const loungeReference = child(child(reference, LOUNGE_REFERENCE), loungeId);
  const lounge = (await get(loungeReference)).val() as Lounge;

  if (!lounge || !lounge.memberIds || !lounge.ownerId) {
    return;
  }

  const filteredMemberIds = lounge.memberIds.filter((id: string) => id !== userId);
  const updates = {
    [`/${LOUNGE_REFERENCE}/${loungeId}/${LOUNGE_OWNER_ID}`]: filteredMemberIds.length === 0 ? null : filteredMemberIds[0],
    [`/${LOUNGE_REFERENCE}/${loungeId}/${LOUNGE_MEMBER_IDS}`]: filteredMemberIds,
    [`/${LOUNGE_REFERENCE}/${loungeId}/${LOUNGE_DELETED_AT}`]: filteredMemberIds.length === 0 ? serverTimestamp() : null,
    [`/${USER_REFERENCE}/${userId}`]: null
  };

  await update(reference, updates);
};