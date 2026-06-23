import * as db from 'firebase/database';
import { FModel } from 'models';
import { LOUNGE, Lounge } from 'features/lounge';
import { CommonError, initialUpdates, Nullable, placeholder, shuffle } from 'shared';
import { getRef } from '../../firebase.util';
import { database } from '../../firebase_config';
import { DAVINCI_CODE, DavinciCode, DavinciCodeTile } from '../model';

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
export const start = async (loungeId: string, userId: string): Promise<void> => {
  const loungeSnapshot = await getRef(loungeReference(loungeId), () => {
    throw new Error(CommonError.NO_LOUNGE);
  });
  const lounge = new FModel<Lounge>(loungeSnapshot).sanitize();
  if (lounge.ownerId !== userId || lounge.status !== 'WAITING') {
    throw new Error(CommonError.PERMISSION_DENIED);
  }

  const statusResult = await db.runTransaction(loungeReference(loungeId), (current) => {
    if (!current || current[LOUNGE.ownerId] !== userId || current[LOUNGE.status] !== 'WAITING') {
      return current;
    }
    return { ...current, [LOUNGE.status]: 'PLAYING' };
  });
  if (!statusResult.committed || statusResult.snapshot.val()?.[LOUNGE.status] !== 'PLAYING') {
    throw new Error(CommonError.PERMISSION_DENIED);
  }

  const shuffledPlayerIds = shuffle(lounge.playerIds);
  const initialHands = shuffledPlayerIds.reduce((acc, playerId) => {
    acc[playerId] = [placeholder];
    return acc;
  }, {} as { [key: string]: Nullable<DavinciCodeTile>[] });
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
    finishedPlayerIds: [placeholder],
    remainingTiles: shuffledTiles,
    pendingTiles: [placeholder],
  };

  const updates = initialUpdates();

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
export const drawTile = async (
  loungeId: string,
  userId: string,
  isWhite: boolean
): Promise<void> => {
  let rejected = false;
  const result = await db.runTransaction(davinciCodeReference(loungeId), (current) => {
    if (!current) {
      rejected = true;
      return;
    }
    const davinciCode = current as DavinciCode;
    if (davinciCode.turn !== userId || davinciCode.phase === 'GUESS') {
      rejected = true;
      return;
    }

    const color = isWhite ? DAVINCI_CODE.white : DAVINCI_CODE.black;
    const remainingTiles = davinciCode.remainingTiles[color] ?? [];
    const [drawnTile, ...updatedTiles] = remainingTiles;
    if (!drawnTile) {
      rejected = true;
      return;
    }

    return {
      ...davinciCode,
      remainingTiles: {
        ...davinciCode.remainingTiles,
        [color]: updatedTiles.length === 0 ? [placeholder] : updatedTiles,
      },
      pendingTiles: [...(davinciCode.pendingTiles ?? []).filter((tile) => tile), drawnTile],
    };
  });

  if (!result.committed || rejected) throw new Error(CommonError.PERMISSION_DENIED);
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
  let rejected = false;
  const result = await db.runTransaction(davinciCodeReference(loungeId), (current) => {
    if (!current) {
      rejected = true;
      return;
    }
    const davinciCode = current as DavinciCode;
    if (davinciCode.turn !== playerId) {
      rejected = true;
      return;
    }

    const nextGame: DavinciCode = {
      ...davinciCode,
      hands: {
        ...davinciCode.hands,
        [playerId]: hand,
      },
    };

    if (!clearPendingTiles) return nextGame;

    nextGame.pendingTiles = [placeholder as unknown as DavinciCodeTile];

    if (davinciCode.phase === 'INITIAL_DRAW') {
      const playerIds = davinciCode.playerIds;
      const nextPlayerId = playerIds[(playerIds.indexOf(playerId) + 1) % playerIds.length];
      const nextPlayersHand = davinciCode.hands[nextPlayerId];

      if (nextPlayersHand.length !== 0) {
        nextGame.phase = 'DRAW';
      }

      nextGame.turn = nextPlayerId;
    } else {
      nextGame.phase = 'GUESS';
    }

    return nextGame;
  });

  if (!result.committed || rejected) throw new Error(CommonError.PERMISSION_DENIED);
};
