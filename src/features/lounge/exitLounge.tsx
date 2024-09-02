import { Lounge } from 'entities';
import { database } from 'features';
import { child, ref as fRefrence, get, serverTimestamp, set } from 'firebase/database';

const LOUNGE_REFERENCE = 'Lounge';

export const exitLounge = async (loungeId: string, userId: string): Promise<void> => {
  const reference = child(fRefrence(database), LOUNGE_REFERENCE);
  const loungeReference = child(reference, loungeId);
  const lounge = (await get(loungeReference)).val() as Lounge;

  if (!lounge || !lounge.memberIds || !lounge.ownerId) {
    return;
  }

  const newLounge = lounge.memberIds.length === 1 ? {
    gameId: lounge.gameId,
    code: lounge.code,
    createdAt: lounge.createdAt,
    deletedAt: serverTimestamp()
  } : {
    gameId: lounge.gameId,
    code: lounge.code,
    memberIds: lounge.memberIds.filter((id: string) => id !== userId),
    ownerId: lounge.ownerId === userId ? lounge.memberIds.filter((id: string) => id !== userId)[0] : lounge.ownerId,
    createdAt: lounge.createdAt,
  };
  await set(loungeReference, newLounge);
};