import { Game } from 'entities';
import { firestore } from 'features';
import { collection, getDocs } from 'firebase/firestore';
import { useQuery } from 'react-query';

const fetchGameList = async (): Promise<Game[]> => {
  const querySnapshot = await getDocs(collection(firestore, "Games"));
  const data = querySnapshot.docs.map(doc => {
    return {
      id: doc.id,
      name: doc.data().name,
      description: doc.data().description,
      image: doc.data().image,
    }
  });

  return data;
};

export const useFetchGameList = () => {
  return useQuery<Game[], Error>('gameList', fetchGameList);
};