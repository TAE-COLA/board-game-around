import { YachtDice } from 'entities';
import { database } from 'features';
import { child, ref as fRefrence, get, update } from 'firebase/database';

const YACHT_DICE_REFERENCE = 'YachtDice';

const YACHT_DICE_BOARDS = 'boards';
const YACHT_DICE_PLAYER_IDS = 'playerIds';
const YACHT_DICE_TURN = 'turn';

export const exitYachtDice = async (loungeId: string, userId: string): Promise<void> => {
  const reference = fRefrence(database);
  const yachtDiceReference = child(child(reference, YACHT_DICE_REFERENCE), loungeId);
  const yachtDice = (await get(yachtDiceReference)).val() as YachtDice;

  if (!yachtDice || !yachtDice.playerIds) {
    return;
  }

  const filteredPlayerIds = yachtDice.playerIds.filter((id: string) => id !== userId);
  
  const updates = {
    [`/${YACHT_DICE_REFERENCE}/${loungeId}/${YACHT_DICE_BOARDS}/${userId}`]: null,
    [`/${YACHT_DICE_REFERENCE}/${loungeId}/${YACHT_DICE_PLAYER_IDS}`]: filteredPlayerIds,
    [`/${YACHT_DICE_REFERENCE}/${loungeId}/${YACHT_DICE_TURN}`]: filteredPlayerIds.length === 0 ? null : yachtDice.turn
  };

  if (filteredPlayerIds.length === 0) {
    updates[`/${YACHT_DICE_REFERENCE}/${loungeId}/${YACHT_DICE_TURN}`] = null;
  } else {
    const playerIndex = yachtDice.playerIds.indexOf(yachtDice.turn);
    const nextPlayerId = yachtDice.playerIds[(playerIndex + 1) % yachtDice.playerIds.length];
    updates[`/${YACHT_DICE_REFERENCE}/${loungeId}/${YACHT_DICE_TURN}`] = nextPlayerId;
  }

  await update(reference, updates);
};