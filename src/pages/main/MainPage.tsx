import { useFetchGameList } from 'features';
import React from 'react';
import { GameCardGrid, Header } from 'widgets';

const MainPage: React.FC = () => {
  const { data: games, isLoading, error } = useFetchGameList();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!games || games.length === 0) {
    return <div>No games found.</div>;
  }

  return (
    <div className="max-w-full px-16 pt-8">
      <Header />

      <GameCardGrid games={games} className="gap-x-8"/>
    </div>
  )
}

export default MainPage;