import * as db from 'firebase/database';
import {
  DAVINCI_CODE,
  DavinciCode,
  DavinciCodePhase,
  DavinciCodeTileColor,
  DavinciCodeTileModel,
  FModel,
  Lounge,
  LOUNGE,
} from 'models';
import { CommonError, initialUpdates, Nullable, placeholder } from 'shared';
import { getRef } from '../firebase.util';
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
  const loungeSnapshot = await getRef(loungeReference(loungeId), () => {
    throw new Error(CommonError.NO_LOUNGE);
  });
  const lounge = new FModel<Lounge>(loungeSnapshot).sanitize();

  const shuffledPlayerIds = lounge.playerIds.shuffle();
  const initialHands = shuffledPlayerIds.reduce((acc, playerId) => {
    acc[playerId] = [placeholder];
    return acc;
  }, {} as { [key: string]: Nullable<DavinciCodeTileModel>[] });
  const shuffledTiles = {
    white: Array.from(
      { length: 13 },
      (_, i) =>
        ({
          color: DavinciCodeTileColor.White,
          value: i !== 12 ? i : '-',
          isRevealed: false,
        } satisfies DavinciCodeTileModel)
    ).shuffle(),
    black: Array.from(
      { length: 13 },
      (_, i) =>
        ({
          color: DavinciCodeTileColor.Black,
          value: i !== 12 ? i : '-',
          isRevealed: false,
        } satisfies DavinciCodeTileModel)
    ).shuffle(),
  };

  const davinciCode = {
    playerIds: shuffledPlayerIds,
    hands: initialHands,
    turn: shuffledPlayerIds[0],
    phase: DavinciCodePhase.INITIAL_DRAW,
    finishedPlayerIds: [placeholder],
    remainingTiles: shuffledTiles,
    pendingTiles: [placeholder],
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
    if (!snapshot.exists()) throw new Error(CommonError.GAME_STATE_FAILED);
    const davinciCode = new FModel<DavinciCode>(snapshot).sanitize();

    onChanged(davinciCode);
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
  const davinciCodeSnapshot = await getRef(davinciCodeReference(loungeId), () => {
    throw new Error(CommonError.NO_GAME_LOUNGE);
  });
  const davinciCode = new FModel<DavinciCode>(davinciCodeSnapshot).sanitize();

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
  const davinciCodeSnapshot = await getRef(davinciCodeReference(loungeId), () => {
    throw new Error(CommonError.NO_GAME_LOUNGE);
  });
  const davinciCode = new FModel<DavinciCode>(davinciCodeSnapshot).sanitize();

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
  ] = updatedTiles.length === 0 ? placeholder : updatedTiles;
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
  hand: DavinciCodeTileModel[],
  clearPendingTiles: boolean
): Promise<void> => {
  const davinciCodeSnapshot = await getRef(davinciCodeReference(loungeId), () => {
    throw new Error(CommonError.NO_GAME_LOUNGE);
  });
  const davinciCode = new FModel<DavinciCode>(davinciCodeSnapshot).sanitize();

  const updates = initialUpdates();

  updates[`/${DAVINCI_CODE.reference}/${loungeId}/${DAVINCI_CODE.hands}/${playerId}`] = hand;

  if (clearPendingTiles) {
    updates[`/${DAVINCI_CODE.reference}/${loungeId}/${DAVINCI_CODE.pendingTiles}`] = [placeholder];

    if (davinciCode.phase === DavinciCodePhase.INITIAL_DRAW) {
      const playerIds = davinciCode.playerIds;
      const nextPlayerId = playerIds[(playerIds.indexOf(playerId) + 1) % playerIds.length];
      const nextPlayersHand = davinciCode.hands[nextPlayerId];

      if (nextPlayersHand.length !== 0) {
        updates[`/${DAVINCI_CODE.reference}/${loungeId}/${DAVINCI_CODE.phase}`] =
          DavinciCodePhase.DRAW;
      }

      updates[`/${DAVINCI_CODE.reference}/${loungeId}/${DAVINCI_CODE.turn}`] = nextPlayerId;
    } else {
      updates[`/${DAVINCI_CODE.reference}/${loungeId}/${DAVINCI_CODE.phase}`] =
        DavinciCodePhase.GUESS;
    }
  }

  await db.update(reference, updates);
};
