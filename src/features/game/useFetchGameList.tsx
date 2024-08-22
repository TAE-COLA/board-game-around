import { Game } from 'entities';
import { useQuery } from 'react-query';

const fetchGameList = async (): Promise<Game[]> => {
  // const response = await fetch('https://api.example.com/games');
  // if (!response.ok) {
  //   throw new Error('Network response was not ok');
  // }
  // return response.json();
  return [
    { id: "1", name: 'Game 1', description: 'Description 1', image: 'https://via.placeholder.com/300' },
    { id: "2", name: 'Game 2', description: 'Description 2', image: 'https://via.placeholder.com/300' },
    { id: "3", name: 'Game 3', description: 'Description 3', image: 'https://via.placeholder.com/300' },
  ];
};

export const useFetchGameList = () => {
  return useQuery<Game[], Error>('gameList', fetchGameList);
};