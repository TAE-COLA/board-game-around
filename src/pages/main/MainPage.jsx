import { useEffect, useState } from 'react';
import { GameCardGrid, Header } from 'widgets';

const MainPage = () => {
  const [games, setGames] = useState([]);
  useEffect(() => {
    const fetchGameData = async () => {
      const data = [
        {
          id: "1",
          name: "게임1",
          description: "게임 설명",
          image: "https://via.placeholder.com/300"
        },
        {
          id: "2",
          name: "게임2",
          description: "게임 설명",
          image: "https://via.placeholder.com/300"
        },
        {
          id: "3",
          name: "게임3",
          description: "게임 설명",
          image: "https://via.placeholder.com/300"
        }
      ];

      setGames(data);
    };

    fetchGameData();
  }, []);

  return (
    <div className="max-w-full px-16 pt-8">
      <Header />

      <GameCardGrid games={ games } />
    </div>
  )
}

export default MainPage;