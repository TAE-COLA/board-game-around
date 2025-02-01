import { DavinciCode } from 'entities/davinci_code';
import { database } from 'features';
import { child, ref as fReference, get, update } from 'firebase/database';

const DAVINCI_CODE_REFERENCE = 'DavinciCode';

const DAVINCI_CODE_PLAYER_IDS = 'playerIds';
const DAVINCI_CODE_HANDS = 'hands';
const DAVINCI_CODE_TURN = 'turn';
const DAVINCI_CODE_FINISHED_PLAYER_IDS = 'finishedPlayerIds';

type Payloads = {
  'draw_chip'?: boolean;
	'guess'?: { playerId: string, handIndex: number };
	'turn' ?: string;
};

export const updateDavinciCodeState = async (
	loungeId: string,
	payloads: Payloads
): Promise<void> => {
  const reference = fReference(database);
  const loungeReference = child(reference, `${DAVINCI_CODE_REFERENCE}/${loungeId}`);
	const val = (await get(loungeReference)).val();
	const lounge = {
		playerIds: val[DAVINCI_CODE_PLAYER_IDS],
		hands: val[DAVINCI_CODE_HANDS],
		turn: val[DAVINCI_CODE_TURN],
		finishedPlayerIds: val[DAVINCI_CODE_FINISHED_PLAYER_IDS]
	} as DavinciCode;

	const updates: { [key: string]: any } = {};

	if (payloads['draw_chip'] !== undefined) {

	}
	if (payloads['guess'] !== undefined) {

	}
	if (payloads['turn'] !== undefined) {

	}

	await update(reference, updates);
};