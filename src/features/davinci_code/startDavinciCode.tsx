import { Lounge } from 'entities';
import { DavinciCodeTile } from 'entities/davinci_code';
import { database } from 'features';
import { child, ref as fReference, get, update } from 'firebase/database';

const DAVINCI_CODE_REFERENCE = 'DavinciCode';
const LOUNGE_REFERENCE = 'Lounge';
const LOUNGE_STATUS = 'status';

const generateTiles = (): DavinciCodeTile[] => {
  const tiles: DavinciCodeTile[] = [];
  for (let i = 1; i <= 13; i++) {
    tiles.push({ isWhite: true, number: i, isRevealed: false });
    tiles.push({ isWhite: false, number: i, isRevealed: false });
  }
  return tiles.sort(() => Math.random() - 0.5);
};

export const startDavinciCode = async (loungeId: string): Promise<void> => {
  const reference = fReference(database);
  const loungeReference = child(child(reference, LOUNGE_REFERENCE), loungeId);
  const loungeSnapshot = await get(loungeReference);
  const lounge = loungeSnapshot.val() as Lounge;

  if (!lounge?.playerIds?.length || !lounge.ownerId) return;

  const shuffledPlayerIds = [...lounge.playerIds].sort(() => Math.random() - 0.5);
  const tiles = generateTiles();
  const hands = shuffledPlayerIds.reduce((acc, playerId, index) => {
    acc[playerId] = tiles.slice(index * 4, index * 4 + 4);
    return acc;
  }, {} as { [key: string]: DavinciCodeTile[] });

  const davinciCode = {
    playerIds: shuffledPlayerIds,
    hands,
    turn: shuffledPlayerIds[0],
    finishedPlayerIds: []
  };

  const updates = {
    [`/${LOUNGE_REFERENCE}/${loungeId}/${LOUNGE_STATUS}`]: 'PLAYING',
    [`/${DAVINCI_CODE_REFERENCE}/${loungeId}`]: davinciCode
  };
  
  await update(reference, updates);
};