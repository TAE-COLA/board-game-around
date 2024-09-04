import { User } from 'entities';
import { database, firestore } from 'features';
import { child, ref as fRefrence, get } from 'firebase/database';
import { collection as fCollection, query as fQuery, getDocs, where } from 'firebase/firestore';

const USER_COLLECTION = 'Users';

const LOUNGE_REFERENCE = 'Lounge';
const LOUNGE_MEMBER_IDS = 'memberIds';

export const fetchMembersByLoungeId = async (loungeId: string): Promise<User[]> => {
  const reference = child(fRefrence(database), LOUNGE_REFERENCE);
  const loungeReference = child(reference, loungeId);
  const memberIdsReference = child(loungeReference, LOUNGE_MEMBER_IDS);
  const snapshot = await get(memberIdsReference);
  
  const memberIds = snapshot.exists() ? Object.keys(snapshot.val()) : [];
  if (memberIds.length === 0) {
    return [];
  } else {
    const collection = fCollection(firestore, USER_COLLECTION);
    const query = fQuery(collection, where('__name__', 'in', memberIds));
    const snapshots = await getDocs(query);
    const data = snapshots.docs.map(doc => doc.data() as User);
    
    return data;
  }
};