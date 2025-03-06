import { DavinciCodeTile } from 'entities';
import { database } from 'features';
import { child, get, ref, update } from 'firebase/database';
import { emptyData } from 'shared';

const DAVINCI_CODE_REFERENCE = 'DavinciCode';
const DAVINCI_CODE_REMAINING_TILES = 'remainingTiles';
const DAVINCI_CODE_PENDING_TILES = 'pendingTiles';

export const drawDavinciCodeTile = async (
  loungeId: string,
  isWhite: boolean
): Promise<void> => {
  const reference = ref(database);
  const davinciCodeReference = child(
    reference,
    `${DAVINCI_CODE_REFERENCE}/${loungeId}`
  );
  const remainingTilesReference = child(
    davinciCodeReference,
    `${DAVINCI_CODE_REMAINING_TILES}/${isWhite ? 'white' : 'black'}`
  );
  const pendingTilesReference = child(
    davinciCodeReference,
    DAVINCI_CODE_PENDING_TILES
  );

  const snapshot = await get(remainingTilesReference);
  const remainingTiles = snapshot.val() as DavinciCodeTile[];

  if (!remainingTiles || remainingTiles.length === 0) {
    return;
  }

  const [drawnTile, ...updatedTiles] = remainingTiles;

  const pendingSnapshot = await get(pendingTilesReference);
  const pendingTiles = (pendingSnapshot.val() as DavinciCodeTile[]) || [];

  pendingTiles.push(drawnTile);

  const updates = {
    [`${DAVINCI_CODE_REMAINING_TILES}/${isWhite ? 'white' : 'black'}`]:
      updatedTiles.length === 0 ? emptyData : updatedTiles,
    [DAVINCI_CODE_PENDING_TILES]: pendingTiles,
  };
  await update(davinciCodeReference, updates);
};
