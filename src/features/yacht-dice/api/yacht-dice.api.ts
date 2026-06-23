import * as db from 'firebase/database';
import { FModel } from 'models';
import { LOUNGE, Lounge } from 'features/lounge';
import { CommonError, initialUpdates, placeholder, shuffle } from 'shared';
import { getRef } from '../../firebase.util';
import { database } from '../../firebase_config';
import { YACHT_DICE, YACHT_DICE_BOARD, YachtDice, YachtDiceBoard } from '../model';

const reference = db.ref(database);

const loungeReference = (loungeId: string) =>
  db.child(db.child(reference, LOUNGE.reference), loungeId);
const yachtDiceReference = (loungeId: string) =>
  db.child(db.child(reference, YACHT_DICE.reference), loungeId);

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
  const initialYachtDiceBoard: YachtDiceBoard = YACHT_DICE_BOARD.reduce((acc, key) => {
    acc[key] = { value: 0, marked: false };
    return acc;
  }, {} as YachtDiceBoard);
  const initialBoards = shuffledPlayerIds.reduce((acc, playerId) => {
    acc[playerId] = { ...initialYachtDiceBoard };
    return acc;
  }, {} as { [key: string]: YachtDiceBoard });

  const yachtDice = {
    loungeId,
    playerIds: shuffledPlayerIds,
    round: 1,
    boards: initialBoards,
    turn: shuffledPlayerIds[0],
    dice: [1, 1, 1, 1, 1],
    keep: [placeholder],
    rolls: 3,
    finishedAt: placeholder,
  };

  const updates = initialUpdates();

  updates[`/${YACHT_DICE.reference}/${loungeId}`] = yachtDice;

  await db.update(reference, updates);
};

export const onStateChanged = (
  loungeId: string,
  onChanged: (yachtDice: YachtDice) => void
): db.Unsubscribe => {
  return db.onValue(yachtDiceReference(loungeId), (snapshot) => {
    if (!snapshot.exists()) throw new Error(CommonError.GAME_STATE_FAILED);
    const yachtDice = new FModel<YachtDice>(snapshot).sanitize();

    onChanged(yachtDice);
  });
};

export const exit = async (loungeId: string, userId: string): Promise<void> => {
  const yachtDiceSnapshot = await getRef(yachtDiceReference(loungeId), () => {
    throw new Error(CommonError.NO_GAME_LOUNGE);
  });
  const yachtDice = new FModel<YachtDice>(yachtDiceSnapshot).sanitize();

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

export const updateBoards = async (
  loungeId: string,
  userId: string,
  key: keyof YachtDiceBoard,
  value: number
): Promise<void> => {
  let rejected = false;
  const result = await db.runTransaction(yachtDiceReference(loungeId), (current) => {
    if (!current) {
      rejected = true;
      return;
    }
    const yachtDice = current as YachtDice;
    if (yachtDice.turn !== userId || yachtDice.finishedAt) {
      rejected = true;
      return;
    }
    if (yachtDice.boards[yachtDice.turn]?.[key]?.marked) {
      rejected = true;
      return;
    }

    const playerIndex = yachtDice.playerIds.indexOf(yachtDice.turn);
    const nextPlayerId = yachtDice.playerIds[(playerIndex + 1) % yachtDice.playerIds.length];

    const afterBoard = {
      ...yachtDice.boards[yachtDice.turn],
      [key]: { value, marked: true },
    } as YachtDiceBoard;
    const sum = YACHT_DICE_BOARD.reduce((acc, key) => acc + afterBoard[key].value, 0);

    if (sum >= 63 && !afterBoard.bonus.marked) {
      afterBoard[YACHT_DICE_BOARD[6]] = {
        value: 35,
        marked: true,
      };
    }

    const nextGame = {
      ...yachtDice,
      turn: nextPlayerId,
      rolls: 3,
      keep: [],
      boards: {
        ...yachtDice.boards,
        [yachtDice.turn]: afterBoard,
      },
    };

    if (playerIndex === yachtDice.playerIds.length - 1) {
      nextGame.round = yachtDice.round + 1;
      if (yachtDice.round === 12) {
        nextGame.finishedAt = db.serverTimestamp() as unknown as Date;
      }
    }

    return nextGame;
  });

  if (!result.committed || rejected) throw new Error(CommonError.PERMISSION_DENIED);
};

export const roll = async (loungeId: string, userId: string, dice: number[]): Promise<void> => {
  let rejected = false;
  const result = await db.runTransaction(yachtDiceReference(loungeId), (current) => {
    if (!current) {
      rejected = true;
      return;
    }
    const yachtDice = current as YachtDice;
    if (yachtDice.turn !== userId || yachtDice.rolls <= 0 || yachtDice.finishedAt) {
      rejected = true;
      return;
    }

    return {
      ...yachtDice,
      dice,
      rolls: yachtDice.rolls - 1,
      keep: yachtDice.rolls === 1 ? [0, 1, 2, 3, 4] : yachtDice.keep,
    };
  });

  if (!result.committed || rejected) throw new Error(CommonError.PERMISSION_DENIED);
};

export const addKeep = async (loungeId: string, userId: string, dieIndex: number): Promise<void> => {
  let rejected = false;
  const result = await db.runTransaction(yachtDiceReference(loungeId), (current) => {
    if (!current) {
      rejected = true;
      return;
    }
    const yachtDice = current as YachtDice;
    if (yachtDice.turn !== userId || yachtDice.rolls === 3 || yachtDice.finishedAt) {
      rejected = true;
      return;
    }
    if (dieIndex < 0 || dieIndex >= yachtDice.dice.length) {
      rejected = true;
      return;
    }

    const newKeep = Array.from(new Set([...(yachtDice.keep ?? []), dieIndex])).sort();

    return { ...yachtDice, keep: newKeep };
  });

  if (!result.committed || rejected) throw new Error(CommonError.PERMISSION_DENIED);
};

export const removeKeep = async (
  loungeId: string,
  userId: string,
  dieIndex: number
): Promise<void> => {
  let rejected = false;
  const result = await db.runTransaction(yachtDiceReference(loungeId), (current) => {
    if (!current) {
      rejected = true;
      return;
    }
    const yachtDice = current as YachtDice;
    if (yachtDice.turn !== userId || yachtDice.finishedAt) {
      rejected = true;
      return;
    }

    const newKeep = yachtDice.keep.filter((keep) => keep !== dieIndex);

    return { ...yachtDice, keep: newKeep };
  });

  if (!result.committed || rejected) throw new Error(CommonError.PERMISSION_DENIED);
};

