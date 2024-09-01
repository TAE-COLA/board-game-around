import { Lounge } from 'entities';
import { database } from 'features';
import { ref as fRefrence, set } from 'firebase/database';
import { generateCode } from 'shared';
import { v4 as uuidv4 } from 'uuid';

const LOUNGE_REFERENCE = 'Lounge/';

export const createLounge = async (gameId: string, ownerId: string): Promise<string> => {
  const lounge: Lounge = {
    id: uuidv4(),
    gameId,
    code: generateCode(10),
    ownerId,
    memberIds: [ownerId],
    createdAt: new Date(),
    deletedAt: null,
  };
  const reference = fRefrence(database, LOUNGE_REFERENCE + lounge.id);
  await set(reference, lounge);

  return lounge.id;
};