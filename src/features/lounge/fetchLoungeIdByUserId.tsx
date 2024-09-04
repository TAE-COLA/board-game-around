import { database } from 'features';
import { child, ref as fRefrence, get } from 'firebase/database';

const USER_REFERENCE = 'User-lounge';

export const fetchLoungeIdByUserId = async (userId: string): Promise<string | null> => {
  const reference = fRefrence(database);
  const snapshot = await get(child(child(reference, USER_REFERENCE), userId));
  const data = snapshot.val();

  if (!data) return null;
  
  const loungeId = data.loungeId;
  return loungeId;
};