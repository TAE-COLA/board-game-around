import { DavinciCodeTile, EmptyData } from 'entities';
import { database } from 'features';
import { child, ref, update } from 'firebase/database';
import { emptyData } from 'shared';

const DAVINCI_CODE_REFERENCE = 'DavinciCode';
const DAVINCI_CODE_HANDS = 'hands';
const DAVINCI_CODE_PHASE = 'phase';
const DAVINCI_CODE_PENDING_TILES = 'pendingTiles';

export const updateDavinciCodeHand = async (
  loungeId: string,
  playerId: string,
  hand: DavinciCodeTile[],
  clearPendingTiles: boolean
): Promise<void> => {
  const reference = ref(database);
  const davinciCodeReference = child(
    reference,
    `${DAVINCI_CODE_REFERENCE}/${loungeId}`
  );

  const updates: { [key: string]: DavinciCodeTile[] | EmptyData[] | string } =
    {};

  updates[`/${DAVINCI_CODE_HANDS}/${playerId}`] = hand;
  if (clearPendingTiles) {
    updates[`/${DAVINCI_CODE_PENDING_TILES}`] = [emptyData];
    updates[`/${DAVINCI_CODE_PHASE}`] = 'GUESS';
  }

  await update(davinciCodeReference, updates);
};
