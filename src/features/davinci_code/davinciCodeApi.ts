import * as db from 'firebase/database';
import { DAVINCI_CODE, DavinciCode, DavinciCodeTile, LOUNGE, Lounge } from 'models';
import { CommonError, emptyData, EmptyData, initialUpdates, sanitize, shuffle } from 'shared';
import { database } from '../firebase_config';

const reference = db.ref(database);

const loungeReference = (loungeId: string) =>
  db.child(db.child(reference, LOUNGE.reference), loungeId);
const davinciCodeReference = (loungeId: string) =>
  db.child(db.child(reference, DAVINCI_CODE.reference), loungeId);

/**
 *
 * @param loungeId Lounge ID
 * @returns Promise<void>
 *
 * 다빈치코드 게임을 시작합니다.
 */
export const start = async (loungeId: string): Promise<void> => {
  const loungeSnapshot = await db.get(loungeReference(loungeId));
  const lounge = sanitize(loungeSnapshot.val() as Lounge).val();

  const shuffledPlayerIds = shuffle(lounge.playerIds);
  const initialHands = shuffledPlayerIds.reduce((acc, playerId) => {
    acc[playerId] = [emptyData];
    return acc;
  }, {} as { [key: string]: (DavinciCodeTile | EmptyData)[] });
  const shuffledTiles = {
    white: shuffle(
      Array.from({ length: 13 }, (_, i) => ({
        isRevealed: false,
        number: i !== 12 ? `${i}` : '-',
        isWhite: true,
      }))
    ),
    black: shuffle(
      Array.from({ length: 13 }, (_, i) => ({
        isRevealed: false,
        number: i !== 12 ? `${i}` : '-',
        isWhite: false,
      }))
    ),
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

  const updates = initialUpdates();

  updates[`/${LOUNGE.reference}/${loungeId}/${LOUNGE.status}`] = 'PLAYING';
  updates[`/${DAVINCI_CODE.reference}/${loungeId}`] = davinciCode;

  await db.update(reference, updates);
};

/**
 *
 * @param loungeId Lounge ID
 * @param onChanged Callback function
 * @returns db.Unsubscribe
 *
 * 다빈치코드 게임의 상태가 변경되었을 때 호출됩니다.
 */
export const onStateChanged = (
  loungeId: string,
  onChanged: (davinciCode: DavinciCode) => void
): db.Unsubscribe => {
  return db.onValue(davinciCodeReference(loungeId), (snapshot) => {
    const data = snapshot.val() as DavinciCode;

    onChanged(
      sanitize(data, () => {
        throw new Error(CommonError.GAME_STATE_FAILED);
      }).val()
    );
  });
};

/**
 *
 * @param loungeId Lounge ID
 * @param userId User ID
 * @returns Promise<void>
 *
 * 다빈치코드 게임에서 나갑니다.
 */
export const exit = async (loungeId: string, userId: string): Promise<void> => {
  const davinciCodeSnapshot = await db.get(davinciCodeReference(loungeId));
  const davinciCode = sanitize(davinciCodeSnapshot.val() as DavinciCode).val();

  const filteredPlayerIds = davinciCode.playerIds.filter((id: string) => id !== userId);

  const updates = initialUpdates();

  updates[`/${DAVINCI_CODE.reference}/${loungeId}/${DAVINCI_CODE.hands}/${userId}`] = null;
  updates[`/${DAVINCI_CODE.reference}/${loungeId}/${DAVINCI_CODE.playerIds}`] = filteredPlayerIds;

  if (filteredPlayerIds.length === 0) {
    updates[`/${DAVINCI_CODE.reference}/${loungeId}/${DAVINCI_CODE.turn}`] = null;
  } else {
    const playerIndex = davinciCode.playerIds.indexOf(davinciCode.turn);
    const nextPlayerId = davinciCode.playerIds[(playerIndex + 1) % davinciCode.playerIds.length];

    updates[`/${DAVINCI_CODE.reference}/${loungeId}/${DAVINCI_CODE.turn}`] = nextPlayerId;
  }

  await db.update(reference, updates);
};

/**
 *
 * @param loungeId Lounge ID
 * @param isWhite Whether the tile is white
 * @returns Promise<void>
 *
 * 다빈치코드 타일을 뽑습니다.
 */
export const drawTile = async (loungeId: string, isWhite: boolean): Promise<void> => {
  const davinciCodeSnapshot = await db.get(davinciCodeReference(loungeId));
  const davinciCode = sanitize(davinciCodeSnapshot.val() as DavinciCode).val();

  const remainingTiles =
    davinciCode.remainingTiles[isWhite ? DAVINCI_CODE.white : DAVINCI_CODE.black];
  const pendingTiles = davinciCode.pendingTiles;

  const [drawnTile, ...updatedTiles] = remainingTiles;
  pendingTiles.push(drawnTile);

  const updates = initialUpdates();
  updates[
    `/${DAVINCI_CODE.reference}/${loungeId}/${DAVINCI_CODE.remainingTiles}/${
      isWhite ? DAVINCI_CODE.white : DAVINCI_CODE.black
    }`
  ] = updatedTiles.length === 0 ? emptyData : updatedTiles;
  updates[`/${DAVINCI_CODE.reference}/${loungeId}/${DAVINCI_CODE.pendingTiles}`] = pendingTiles;

  await db.update(reference, updates);
};

/**
 *
 * @param loungeId Lounge ID
 * @param playerId Player ID
 * @param hand Hand
 * @param clearPendingTiles Whether to clear pending tiles
 * @returns Promise<void>
 *
 * 다빈치코드 패를 업데이트합니다.
 */
export const updateHand = async (
  loungeId: string,
  playerId: string,
  hand: DavinciCodeTile[],
  clearPendingTiles: boolean
): Promise<void> => {
  const davinciCodeSnapshot = await db.get(davinciCodeReference(loungeId));
  const davinciCode = sanitize(davinciCodeSnapshot.val() as DavinciCode).val();

  const updates = initialUpdates();

  updates[`/${DAVINCI_CODE.reference}/${loungeId}/${DAVINCI_CODE.hands}/${playerId}`] = hand;

  if (clearPendingTiles) {
    updates[`/${DAVINCI_CODE.reference}/${loungeId}/${DAVINCI_CODE.pendingTiles}`] = [emptyData];

    if (davinciCode.phase === 'INITIAL_DRAW') {
      const playerIds = davinciCode.playerIds;
      const nextPlayerId = playerIds[(playerIds.indexOf(playerId) + 1) % playerIds.length];
      const nextPlayersHand = davinciCode.hands[nextPlayerId];

      if (nextPlayersHand.length !== 0) {
        updates[`/${DAVINCI_CODE.reference}/${loungeId}/${DAVINCI_CODE.phase}`] = 'DRAW';
      }

      updates[`/${DAVINCI_CODE.reference}/${loungeId}/${DAVINCI_CODE.turn}`] = nextPlayerId;
    } else {
      updates[`/${DAVINCI_CODE.reference}/${loungeId}/${DAVINCI_CODE.phase}`] = 'GUESS';
    }
  }

  await db.update(reference, updates);
};
