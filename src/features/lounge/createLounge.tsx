import { database } from 'features';
import {
  child,
  equalTo,
  query as fQuery,
  ref as fReference,
  get,
  orderByChild,
  push,
  serverTimestamp,
  update,
} from 'firebase/database';
import { generateCode } from 'shared';

const LOUNGE_REFERENCE = 'Lounge';
const USER_REFERENCE = 'User-lounge';

const LOUNGE_CODE = 'code';

const USER_LOUNGE_ID = 'loungeId';

export const createLounge = async (
  gameId: string,
  ownerId: string
): Promise<string> => {
  const reference = fReference(database);

  const loungeId = push(child(reference, LOUNGE_REFERENCE)).key!;
  let code: string = '';

  let isUnique = false;
  while (!isUnique) {
    code = generateCode(10);
    const query = fQuery(
      child(reference, LOUNGE_REFERENCE),
      orderByChild(LOUNGE_CODE),
      equalTo(code)
    );
    const snapshot = await get(query);
    isUnique = !snapshot.exists();
  }

  // Add dummy players
  const dummyPlayers = [
    '0stLzmhQtyc30FIeGii7047uvFv1',
    'CiB1YRBhNVQSW7grv1yOGcGr0wA3',
    'XICkS14iXqU53eYZDr1OlvQeFdA3',
  ];
  const playerIds = [ownerId, ...dummyPlayers];

  const lounge = {
    gameId,
    code,
    ownerId,
    playerIds,
    createdAt: serverTimestamp(),
    status: 'WAITING',
  };

  const updates = {
    [`/${LOUNGE_REFERENCE}/${loungeId}`]: lounge,
    [`/${USER_REFERENCE}/${ownerId}/${USER_LOUNGE_ID}`]: loungeId,
  };

  await update(reference, updates);

  return loungeId;
};
