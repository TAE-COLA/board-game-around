import { YachtDice, YachtDiceBoard } from 'entities';
import { database } from 'features';
import { child, ref as fReference, get, serverTimestamp, update } from 'firebase/database';

const YACHT_DICE_REFERENCE = 'YachtDice';

const YACHT_DICE_PLAYER_IDS = 'playerIds';
const YACHT_DICE_ROUND = 'round';
const YACHT_DICE_BOARDS = 'boards';
const YACHT_DICE_TURN = 'turn';
const YACHT_DICE_DICE = 'dice';
const YACHT_DICE_KEEP = 'keep';
const YACHT_DICE_ROLLS = 'rolls';
const YACHT_DICE_FINISHED_AT = 'finishedAt';

type Payloads = {
  'boards'?: { key: string; value: number };
  'dice'?: number[];
  'keep-add'?: number;
  'keep-remove'?: number;
  'rolls-decrease'?: number;
  'turn'?: string;
};

export const updateYachtDiceState = async (
  loungeId: string, 
  payloads: Payloads
): Promise<void> => {
  const reference = fReference(database);
  const loungeReference = child(reference, `${YACHT_DICE_REFERENCE}/${loungeId}`);
  const val = (await get(loungeReference)).val();
  const lounge = {
    playerIds: val[YACHT_DICE_PLAYER_IDS],
    boards: val[YACHT_DICE_BOARDS],
    round: val[YACHT_DICE_ROUND],
    turn: val[YACHT_DICE_TURN],
    dice: val[YACHT_DICE_DICE],
    keep: val[YACHT_DICE_KEEP] ?? [],
    rolls: val[YACHT_DICE_ROLLS],
    finishedAt: val[YACHT_DICE_FINISHED_AT],
  } as YachtDice;

  const updates: { [key: string]: any } = {};
  
  if (payloads['boards'] !== undefined) {
    const playerIndex = lounge.playerIds.indexOf(lounge.turn);
    const nextPlayerId = lounge.playerIds[(playerIndex + 1) % lounge.playerIds.length];
    updates[`/${YACHT_DICE_REFERENCE}/${loungeId}/${YACHT_DICE_TURN}`] = nextPlayerId;

    updates[`/${YACHT_DICE_REFERENCE}/${loungeId}/${YACHT_DICE_ROLLS}`] = 3;
    updates[`/${YACHT_DICE_REFERENCE}/${loungeId}/${YACHT_DICE_KEEP}`] = [];

    const { key, value } = payloads['boards'];
    updates[`/${YACHT_DICE_REFERENCE}/${loungeId}/${YACHT_DICE_BOARDS}/${lounge.turn}/${key}`] = { value, marked: true };

    const afterBoard = { ...lounge.boards[lounge.turn], [key]: { value, marked: true } } as YachtDiceBoard;
    const sum = afterBoard.ace.value + afterBoard.double.value + afterBoard.triple.value + afterBoard.quadra.value + afterBoard.penta.value + afterBoard.hexa.value;
    if (sum >= 63) {
      updates[`/${YACHT_DICE_REFERENCE}/${loungeId}/${YACHT_DICE_BOARDS}/${lounge.turn}/bonus`] = { value: 35, marked: true };
    }
    if (playerIndex === lounge.playerIds.length - 1) {
      updates[`/${YACHT_DICE_REFERENCE}/${loungeId}/${YACHT_DICE_ROUND}`] = lounge.round + 1;
      if (lounge.round + 1 === 13) {
        updates[`/${YACHT_DICE_REFERENCE}/${loungeId}/${YACHT_DICE_FINISHED_AT}`] = serverTimestamp();
      }
    }
  }
  if (payloads['dice'] !== undefined) {
    updates[`/${YACHT_DICE_REFERENCE}/${loungeId}/${YACHT_DICE_DICE}`] = payloads['dice'];
  }
  if (payloads['keep-add'] !== undefined) {
    const keep = [...lounge.keep, payloads['keep-add']];
    updates[`/${YACHT_DICE_REFERENCE}/${loungeId}/${YACHT_DICE_KEEP}`] = keep;
  }
  if (payloads['keep-remove'] !== undefined) {
    if (lounge.rolls === 0) {
      throw new Error('No more rolls left');
    }
    const keep = lounge.keep.filter((index: number) => index !== payloads['keep-remove']);
    updates[`/${YACHT_DICE_REFERENCE}/${loungeId}/${YACHT_DICE_KEEP}`] = keep;
  }
  if (payloads['rolls-decrease'] !== undefined) {
    if (lounge.rolls === 0) {
      throw new Error('No more rolls left');
    } else if (lounge.rolls <= 1) {
      updates[`/${YACHT_DICE_REFERENCE}/${loungeId}/${YACHT_DICE_KEEP}`] = [0, 1, 2, 3, 4];
    }
    updates[`/${YACHT_DICE_REFERENCE}/${loungeId}/${YACHT_DICE_ROLLS}`] = lounge.rolls - payloads['rolls-decrease'];
  }
  if (payloads['turn'] !== undefined) {
    updates[`/${YACHT_DICE_REFERENCE}/${loungeId}/${YACHT_DICE_TURN}`] = payloads['turn'];
  }
  
  await update(reference, updates);
};