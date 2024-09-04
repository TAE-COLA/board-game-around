import { Lounge } from 'entities';
import { database } from 'features';
import { child, ref as fRefrence, get, serverTimestamp, set } from 'firebase/database';

const LOUNGE_REFERENCE = 'Lounge';

const LOUNGE_OWNER_ID = 'ownerId';
const LOUNGE_MEMBER_IDS = 'memberIds';
const LOUNGE_DELETED_AT = 'deletedAt';

export const exitLounge = async (loungeId: string, userId: string): Promise<void> => {
  const reference = child(fRefrence(database), LOUNGE_REFERENCE);
  const loungeReference = child(reference, loungeId);
  const lounge = (await get(loungeReference)).val() as Lounge;

  if (!lounge || !lounge.memberIds || !lounge.ownerId) {
    return;
  }

  const memberIdsReference = child(loungeReference, LOUNGE_MEMBER_IDS);
  set(child(memberIdsReference, userId), null);

  if (lounge.ownerId === userId) {
    const newOwnerId = Object.keys(lounge.memberIds).find((id: string) => id !== userId);
    if (newOwnerId) {
      await set(child(loungeReference, LOUNGE_OWNER_ID), newOwnerId);
    } else {
      await set(child(loungeReference, LOUNGE_OWNER_ID), null);
      await set(child(loungeReference, LOUNGE_DELETED_AT), serverTimestamp());
    }
  }
};