import { Lounge } from 'entities';
import { DavinciCodeChip } from 'entities/davinci_code';
import { database } from 'features';
import { child, ref as fReference, get, update } from 'firebase/database';
import { createDummy } from 'shared';

const DAVINCI_CODE_REFERENCE = 'DavinciCode';
const LOUNGE_REFERENCE = 'Lounge';

const DAVINCI_CODE_PLAYER_IDS = 'playerIds';
const DAVINCI_CODE_HANDS = 'hands';
const DAVINCI_CODE_TURN = 'turn';
const DAVINCI_CODE_FINISHED_PLAYER_IDS = 'finishedPlayerIds';

const LOUNGE_STATUS = 'status';

export const startDavinciCode = async (loungeId: string): Promise<void> => {
	const reference = fReference(database);

	const loungeReference = child(child(reference, LOUNGE_REFERENCE), loungeId);
	const lounge = ((await get(loungeReference)).val() as Lounge);

	if (!lounge || !lounge.playerIds || !lounge.ownerId) return;

	const tempHands = [
		{
			isWhite: false,
			number: 1,
			isRevealed: true
		} as DavinciCodeChip,
		{
			isWhite: true,
			number: 2,
			isRevealed: false
		} as DavinciCodeChip,
		{
			isWhite: false,
			number: 3,
			isRevealed: false
		} as DavinciCodeChip,
		{
			isWhite: true,
			number: 3,
			isRevealed: false
		} as DavinciCodeChip
	]

	const shuffledPlayerIds = lounge.playerIds.sort(() => Math.random() - 0.5);
	const davinciCode = {
		playerIds: shuffledPlayerIds,
		hands: shuffledPlayerIds.reduce((acc, playerId) => {
			acc[playerId] = tempHands;
			return acc;
		}, {} as { [key: string]: DavinciCodeChip[] }),
		turn: shuffledPlayerIds[0],
		finishedPlayerIds: []
	};

	const updates = {
		[`/${LOUNGE_REFERENCE}/${loungeId}/${LOUNGE_STATUS}`]: 'PLAYING',
		[`/${DAVINCI_CODE_REFERENCE}/${loungeId}`]: davinciCode
	};
	
	await update(reference, updates);
}