import * as db from 'firebase/database';
import { FModel, Lounge, LOUNGE, TheMind, THE_MIND } from 'models';
import { CommonError, initialUpdates, placeholder, shuffle } from 'shared';
import { getRef } from '../firebase.util';
import { database } from '../firebase_config';

const reference = db.ref(database);

const loungeReference = (loungeId: string) =>
  db.child(db.child(reference, LOUNGE.reference), loungeId);
const theMindReference = (loungeId: string) =>
  db.child(db.child(reference, THE_MIND.reference), loungeId);

const getMaxLevel = (playerCount: number) => {
  if (playerCount === 2) return 12;
  if (playerCount === 3) return 10;
  return 8;
};

export const start = async (loungeId: string): Promise<void> => {
  const loungeSnapshot = await getRef(loungeReference(loungeId), () => {
    throw new Error(CommonError.NO_LOUNGE);
  });
  const lounge = new FModel<Lounge>(loungeSnapshot).sanitize();

  if (lounge.status !== 'WAITING') throw new Error(CommonError.NO_LOUNGE);
  if (lounge.playerIds.length < 2 || lounge.playerIds.length > 4) {
    throw new Error(CommonError.NO_LOUNGE);
  }

  const playerIds = shuffle(lounge.playerIds);
  const deck = shuffle(Array.from({ length: 100 }, (_, index) => index + 1));
  const hands = playerIds.reduce((acc, playerId, playerIndex) => {
    acc[playerId] = [deck[playerIndex]].sort((a, b) => a - b);
    return acc;
  }, {} as { [key: string]: number[] });

  const theMind: TheMind = {
    loungeId,
    playerIds,
    level: 1,
    maxLevel: getMaxLevel(playerIds.length),
    lives: playerIds.length,
    stars: 1,
    hands,
    playedCards: [placeholder as unknown as number],
    discardedCards: [placeholder as unknown as number],
    readyPlayerIds: [placeholder as unknown as string],
    phase: 'READY',
  };

  const updates = initialUpdates();

  updates[`/${LOUNGE.reference}/${loungeId}/${LOUNGE.status}`] = 'PLAYING';
  updates[`/${THE_MIND.reference}/${loungeId}`] = theMind;

  await db.update(reference, updates);
};

export const onStateChanged = (
  loungeId: string,
  onChanged: (theMind: TheMind) => void
): db.Unsubscribe => {
  return db.onValue(theMindReference(loungeId), (snapshot) => {
    if (!snapshot.exists()) throw new Error(CommonError.GAME_STATE_FAILED);
    const theMind = new FModel<TheMind>(snapshot).sanitize();

    onChanged(theMind);
  });
};

export const exit = async (loungeId: string, userId: string): Promise<void> => {
  const theMindSnapshot = await getRef(theMindReference(loungeId), () => {
    throw new Error(CommonError.NO_GAME_LOUNGE);
  });
  const theMind = new FModel<TheMind>(theMindSnapshot).sanitize();

  const filteredPlayerIds = theMind.playerIds.filter((id) => id !== userId);
  const updates = initialUpdates();

  updates[`/${THE_MIND.reference}/${loungeId}/${THE_MIND.hands}/${userId}`] = null;
  updates[`/${THE_MIND.reference}/${loungeId}/${THE_MIND.playerIds}`] = filteredPlayerIds;
  updates[`/${THE_MIND.reference}/${loungeId}/${THE_MIND.readyPlayerIds}`] =
    theMind.readyPlayerIds.filter((id) => id !== userId);

  if (filteredPlayerIds.length === 0) {
    updates[`/${THE_MIND.reference}/${loungeId}/${THE_MIND.finishedAt}`] = db.serverTimestamp();
  }

  await db.update(reference, updates);
};
