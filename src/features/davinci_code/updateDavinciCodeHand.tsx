import { database } from 'features';
import { child, ref, update } from 'firebase/database';
import { DavinciCodeTile, EmptyData } from 'models';
import { emptyData, sanitize } from 'shared';

const DAVINCI_CODE_REFERENCE = 'DavinciCode';
const DAVINCI_CODE_PLAYER_IDS = 'playerIds';
const DAVINCI_CODE_HANDS = 'hands';
const DAVINCI_CODE_TURN = 'turn';
const DAVINCI_CODE_PHASE = 'phase';
const DAVINCI_CODE_PENDING_TILES = 'pendingTiles';

export const updateDavinciCodeHand = async (
  loungeId: string,
  playerId: string,
  hand: DavinciCodeTile[],
  clearPendingTiles: boolean
): Promise<void> => {
  const reference = ref(database);
  const davinciCodeReference = child(reference, `${DAVINCI_CODE_REFERENCE}/${loungeId}`);

  const updates: { [key: string]: DavinciCodeTile[] | EmptyData[] | string } = {};

  updates[`/${DAVINCI_CODE_HANDS}/${playerId}`] = hand;

  if (clearPendingTiles) {
    updates[`/${DAVINCI_CODE_PENDING_TILES}`] = [emptyData];

    const phase = (await database.ref(`${DAVINCI_CODE_REFERENCE}/${loungeId}/${DAVINCI_CODE_PHASE}`).get()).val();
    console.log(phase);
    if (phase === 'INITIAL_DRAW') {
      const playerIds = (
        await database.ref(`${DAVINCI_CODE_REFERENCE}/${loungeId}/${DAVINCI_CODE_PLAYER_IDS}`).get()
      ).val();
      const nextPlayerId = playerIds[(playerIds.indexOf(playerId) + 1) % playerIds.length];
      const nextPlayersHand = (
        await database.ref(`${DAVINCI_CODE_REFERENCE}/${loungeId}/${DAVINCI_CODE_HANDS}/${nextPlayerId}`).get()
      ).val();

      if (sanitize(nextPlayersHand).length !== 0) {
        updates[`/${DAVINCI_CODE_PHASE}`] = 'DRAW';
      }

      updates[`/${DAVINCI_CODE_TURN}`] = nextPlayerId;
    } else {
      updates[`/${DAVINCI_CODE_PHASE}`] = 'GUESS';
    }
  }

  await update(davinciCodeReference, updates);
};
