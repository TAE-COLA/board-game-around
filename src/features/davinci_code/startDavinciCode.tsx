import { DavinciCodeTile, EmptyData, Lounge } from 'entities';
import { database } from 'features';
import { child, ref as fReference, get, update } from 'firebase/database';
import { emptyData } from 'shared';

const DAVINCI_CODE_REFERENCE = 'DavinciCode';
const LOUNGE_REFERENCE = 'Lounge';
const LOUNGE_STATUS = 'status';

export const startDavinciCode = async (loungeId: string): Promise<void> => {
  const reference = fReference(database);
  const loungeReference = child(child(reference, LOUNGE_REFERENCE), loungeId);
  const loungeSnapshot = await get(loungeReference);
  const lounge = loungeSnapshot.val() as Lounge;

  if (!lounge?.playerIds?.length || !lounge.ownerId) return;

  const shuffledPlayerIds = [...lounge.playerIds].sort(
    () => Math.random() - 0.5
  );

  const davinciCode = {
    playerIds: shuffledPlayerIds,
    hands: shuffledPlayerIds.reduce((acc, playerId) => {
      acc[playerId] = [emptyData];
      return acc;
    }, {} as { [key: string]: (DavinciCodeTile | EmptyData)[] }),
    turn: shuffledPlayerIds[0],
    finishedPlayerIds: [emptyData],
  };

  const updates = {
    [`/${LOUNGE_REFERENCE}/${loungeId}/${LOUNGE_STATUS}`]: 'PLAYING',
    [`/${DAVINCI_CODE_REFERENCE}/${loungeId}`]: davinciCode,
  };

  await update(reference, updates);
};
