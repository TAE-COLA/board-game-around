import { database } from 'features';
import { child, ref as fRefrence, get, update } from 'firebase/database';
import { DavinciCode } from 'models';

const DAVINCI_CODE_REFERENCE = 'DavinciCode';

const DAVINCI_CODE_PLAYER_IDS = 'playerIds';
const DAVINCI_CODE_HANDS = 'hands';
const DAVINCI_CODE_TURN = 'turn';
const DAVINCI_CODE_FINISHED_PLAYER_IDS = 'finishedPlayerIds';

export const exitDavinciCode = async (loungeId: string, userId: string): Promise<void> => {
  const reference = fRefrence(database);
  const davinciCodeReference = child(child(reference, DAVINCI_CODE_REFERENCE), loungeId);
  const davinciCode = (await get(davinciCodeReference)).val() as DavinciCode;

  if (!davinciCode || !davinciCode.playerIds) {
    return;
  }

  const filteredPlayerIds = davinciCode.playerIds.filter((id: string) => id !== userId);

  const updates = {
    [`/${DAVINCI_CODE_REFERENCE}/${loungeId}/${DAVINCI_CODE_HANDS}/${userId}`]: null,
    [`/${DAVINCI_CODE_REFERENCE}/${loungeId}/${DAVINCI_CODE_PLAYER_IDS}`]: filteredPlayerIds,
    [`/${DAVINCI_CODE_REFERENCE}/${loungeId}/${DAVINCI_CODE_TURN}`]:
      filteredPlayerIds.length === 0 ? null : davinciCode.turn,
  };

  if (filteredPlayerIds.length === 0) {
    updates[`/${DAVINCI_CODE_REFERENCE}/${loungeId}/${DAVINCI_CODE_TURN}`] = null;
  } else {
    const playerIndex = davinciCode.playerIds.indexOf(davinciCode.turn);
    const nextPlayerId = davinciCode.playerIds[(playerIndex + 1) % davinciCode.playerIds.length];
    updates[`/${DAVINCI_CODE_REFERENCE}/${loungeId}/${DAVINCI_CODE_TURN}`] = nextPlayerId;
  }

  await update(reference, updates);
};
