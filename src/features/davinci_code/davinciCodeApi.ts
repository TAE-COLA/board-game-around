import { database } from 'features';
import * as db from 'firebase/database';
import { DavinciCodeTile, Lounge } from 'models';
import { emptyData, EmptyData, sanitize } from 'shared';

const PATH = {
  reference: 'DavinciCode',
  loungeId: 'loungeId',
  playerIds: 'playerIds',
  hands: 'hands',
  turn: 'turn',
  phase: 'phase',
  finishedPlayerIds: 'finishedPlayerIds',
  remainingTiles: 'remainingTiles',
  white: 'white',
  black: 'black',
  pendingTiles: 'pendingTiles',
  finishedAt: 'finishedAt',
} as const;

export const startDavinciCode = async (loungeId: string): Promise<void> => {
  const davinciCodeReference = db.child(db.ref(database), PATH.reference);
  const loungeReference = db.child(davinciCodeReference, loungeId);
  const loungeSnapshot = await db.get(loungeReference);
  const data = loungeSnapshot.val() as Lounge;

  const lounge = sanitize(data).val();

  const shuffledPlayerIds = [...lounge.playerIds].sort(() => Math.random() - 0.5);

  const initialHands = shuffledPlayerIds.reduce((acc, playerId) => {
    acc[playerId] = [emptyData];
    return acc;
  }, {} as { [key: string]: (DavinciCodeTile | EmptyData)[] });

  const shuffledTiles = {
    white: Array.from({ length: 13 }, (_, i) => ({
      isRevealed: false,
      number: i !== 12 ? `${i}` : '-',
      isWhite: true,
    })).sort(() => Math.random() - 0.5),
    black: Array.from({ length: 13 }, (_, i) => ({
      isRevealed: false,
      number: i !== 12 ? `${i}` : '-',
      isWhite: false,
    })).sort(() => Math.random() - 0.5),
  };

  const davinciCode = {
    playerIds: shuffledPlayerIds,
    hands: initialHands,
    turn: shuffledPlayerIds[0],
    phase: 'INITIAL_DRAW',
    finishedPlayerIds: [emptyData],
    remainingTiles: shuffledTiles,
    pendingTiles: [emptyData],
  };

  const updates = {
    [`/${LOUNGE_REFERENCE}/${loungeId}/${LOUNGE_STATUS}`]: 'PLAYING',
    [`/${DAVINCI_CODE_REFERENCE}/${loungeId}`]: davinciCode,
  };

  await update(reference, updates);
};
