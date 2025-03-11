import { database } from 'features';
import { child, ref as fRefrence, get } from 'firebase/database';
import { UserLounge } from 'models';
import { errorNoLounge, sanitize } from 'shared';

const REFERENCE_USER_LOUNGE = 'User-lounge';

export const fetchLoungeIdByUserId = async (userId: string): Promise<string> => {
  const reference = fRefrence(database);
  const snapshot = await get(child(child(reference, REFERENCE_USER_LOUNGE), userId));
  const data = snapshot.val() as UserLounge;

  const userLounge = sanitize(data, () => {
    throw new Error(errorNoLounge);
  }).val();

  return userLounge.loungeId;
};
