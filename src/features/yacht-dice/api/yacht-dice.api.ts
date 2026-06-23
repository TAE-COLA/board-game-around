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

export const start = async (loungeId: string): Promise<void> => {
  const loungeSnapshot = await getRef(loungeReference(loungeId), () => {
    throw new Error(CommonError.NO_LOUNGE);
  });
  const lounge = new FModel<Lounge>(loungeSnapshot).sanitize();

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

  updates[`/${LOUNGE.reference}/${loungeId}/${LOUNGE.status}`] = 'PLAYING';
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
  key: keyof YachtDiceBoard,
  value: number
): Promise<void> => {
  const yachtDiceSnapshot = await getRef(yachtDiceReference(loungeId), () => {
    throw new Error(CommonError.NO_GAME_LOUNGE);
  });
  const yachtDice = new FModel<YachtDice>(yachtDiceSnapshot).sanitize();

  const playerIndex = yachtDice.playerIds.indexOf(yachtDice.turn);
  const nextPlayerId = yachtDice.playerIds[(playerIndex + 1) % yachtDice.playerIds.length];

  const updates = initialUpdates();

  updates[`/${YACHT_DICE.reference}/${loungeId}/${YACHT_DICE.turn}`] = nextPlayerId;
  updates[`/${YACHT_DICE.reference}/${loungeId}/${YACHT_DICE.rolls}`] = 3;
  updates[`/${YACHT_DICE.reference}/${loungeId}/${YACHT_DICE.keep}`] = [];

  updates[`/${YACHT_DICE.reference}/${loungeId}/${YACHT_DICE.boards}/${yachtDice.turn}/${key}`] = {
    value,
    marked: true,
  };

  const afterBoard = {
    ...yachtDice.boards[yachtDice.turn],
    [key]: { value, marked: true },
  } as YachtDiceBoard;
  const sum = YACHT_DICE_BOARD.reduce((acc, key) => acc + afterBoard[key].value, 0);

  if (sum >= 63 && !afterBoard.bonus.marked) {
    updates[
      `/${YACHT_DICE.reference}/${loungeId}/${YACHT_DICE.boards}/${yachtDice.turn}/${YACHT_DICE_BOARD[6]}`
    ] = {
      value: 35,
      marked: true,
    };
  }

  if (playerIndex === yachtDice.playerIds.length - 1) {
    updates[`/${YACHT_DICE.reference}/${loungeId}/${YACHT_DICE.round}`] = yachtDice.round + 1;
    if (yachtDice.round === 12) {
      updates[`/${YACHT_DICE.reference}/${loungeId}/${YACHT_DICE.finishedAt}`] =
        db.serverTimestamp();
    }
  }

  await db.update(reference, updates);
};

export const updateDice = async (loungeId: string, dice: number[]): Promise<void> => {
  const updates = initialUpdates();

  updates[`/${YACHT_DICE.reference}/${loungeId}/${YACHT_DICE.dice}`] = dice;

  await db.update(reference, updates);
};

export const addKeep = async (loungeId: string, die: number): Promise<void> => {
  const yachtDiceSnapshot = await getRef(yachtDiceReference(loungeId), () => {
    throw new Error(CommonError.NO_GAME_LOUNGE);
  });
  const yachtDice = new FModel<YachtDice>(yachtDiceSnapshot).sanitize();

  const newKeep = [...yachtDice.keep, die];

  const updates = initialUpdates();

  updates[`/${YACHT_DICE.reference}/${loungeId}/${YACHT_DICE.keep}`] = newKeep;

  await db.update(reference, updates);
};

export const removeKeep = async (loungeId: string, die: number): Promise<void> => {
  const yachtDiceSnapshot = await getRef(yachtDiceReference(loungeId), () => {
    throw new Error(CommonError.NO_GAME_LOUNGE);
  });
  const yachtDice = new FModel<YachtDice>(yachtDiceSnapshot).sanitize();

  const newKeep = yachtDice.keep.filter((keep) => keep !== die);

  const updates = initialUpdates();

  updates[`/${YACHT_DICE.reference}/${loungeId}/${YACHT_DICE.keep}`] = newKeep;

  await db.update(reference, updates);
};

export const decreaseRolls = async (loungeId: string): Promise<void> => {
  const yachtDiceSnapshot = await getRef(yachtDiceReference(loungeId), () => {
    throw new Error(CommonError.NO_GAME_LOUNGE);
  });
  const yachtDice = new FModel<YachtDice>(yachtDiceSnapshot).sanitize();

  if (yachtDice.rolls === 0) {
    throw new Error(CommonError.YACHT_DICE_NO_MORE_ROLLS);
  }

  const updates = initialUpdates();

  if (yachtDice.rolls === 1) {
    updates[`/${YACHT_DICE.reference}/${loungeId}/${YACHT_DICE.keep}`] = [0, 1, 2, 3, 4];
  }

  updates[`/${YACHT_DICE.reference}/${loungeId}/${YACHT_DICE.rolls}`] = yachtDice.rolls - 1;

  await db.update(reference, updates);
};

export const updateTurn = async (loungeId: string, nextPlayerId: string): Promise<void> => {
  const updates = initialUpdates();

  updates[`/${YACHT_DICE.reference}/${loungeId}/${YACHT_DICE.turn}`] = nextPlayerId;

  await db.update(reference, updates);
};
