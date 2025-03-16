import * as db from 'firebase/database';
import { LOUNGE, Lounge, YACHT_DICE, YACHT_DICE_BOARD, YachtDice, YachtDiceBoard } from 'models';
import { initialUpdates, sanitize, shuffle } from 'shared';
import { database } from '../firebase_config';

const reference = db.ref(database);

const loungeReference = (loungeId: string) =>
  db.child(db.child(reference, LOUNGE.reference), loungeId);
const yachtDiceReference = (loungeId: string) =>
  db.child(db.child(reference, YACHT_DICE.reference), loungeId);

export const start = async (loungeId: string): Promise<void> => {
  const loungeSnapshot = await db.get(loungeReference(loungeId));
  const lounge = sanitize(loungeSnapshot.val() as Lounge).val();

  const shuffledPlayerIds = shuffle(lounge.playerIds);
  const initialYachtDiceBoard: YachtDiceBoard = YACHT_DICE_BOARD.reduce((acc, key) => {
    acc[key] = { value: 0, marked: false };
    return acc;
  }, {} as YachtDiceBoard);
  const initialBoards = shuffledPlayerIds.reduce((acc, playerId) => {
    acc[playerId] = { ...initialYachtDiceBoard };
    return acc;
  }, {} as { [key: string]: YachtDiceBoard });

  const yachtDice = {
    playerIds: shuffledPlayerIds,
    round: 1,
    boards: initialBoards,
    turn: shuffledPlayerIds[0],
    dice: [1, 1, 1, 1, 1],
    keep: [],
    rolls: 3,
  };

  const updates = initialUpdates();

  updates[`/${LOUNGE.reference}/${loungeId}/${LOUNGE.status}`] = 'PLAYING';
  updates[`/${YACHT_DICE.reference}/${loungeId}`] = yachtDice;

  await db.update(reference, updates);
};

export const onStateChanged = (
  loungeId: string,
  onChanged: (yachtDice: YachtDice) => void
): db.Unsubscribe => {
  return db.onValue(yachtDiceReference(loungeId), (snapshot) => {
    const data = snapshot.val() as YachtDice;
    const yachtDice = sanitize(data, () => {
      throw new Error(CommonError.GAME_STATE_FAILED);
    }).val();

    onChanged(yachtDice);
  });
};

export const exit = async (loungeId: string, userId: string): Promise<void> => {
  const yachtDiceSnapshot = await db.get(yachtDiceReference(loungeId));
  const yachtDice = sanitize(yachtDiceSnapshot.val() as YachtDice).val();

  const filteredPlayerIds = yachtDice.playerIds.filter((id: string) => id !== userId);

  const updates = initialUpdates();

  updates[`/${YACHT_DICE.reference}/${loungeId}/${YACHT_DICE.boards}/${userId}`] = null;
  updates[`/${YACHT_DICE.reference}/${loungeId}/${YACHT_DICE.playerIds}`] = filteredPlayerIds;

  if (filteredPlayerIds.length === 0) {
    updates[`/${YACHT_DICE.reference}/${loungeId}/${YACHT_DICE.turn}`] = null;
  } else {
    const playerIndex = yachtDice.playerIds.indexOf(yachtDice.turn);
    const nextPlayerId = yachtDice.playerIds[(playerIndex + 1) % yachtDice.playerIds.length];

    updates[`/${YACHT_DICE.reference}/${loungeId}/${YACHT_DICE.turn}`] = nextPlayerId;
  }

  await db.update(reference, updates);
};
