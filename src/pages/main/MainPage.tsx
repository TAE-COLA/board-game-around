import { Box } from '@chakra-ui/react';
import { useFetchGameList } from 'features';
import React from 'react';
import { GameCardGrid, Header, Page } from 'widgets';

const MainPage: React.FC = () => {
  const { data: games } = useFetchGameList();

  return (
    <Page>
      <Header />
      {!games || games.length === 0 ? 
        <Box>No games found.</Box> : 
        <GameCardGrid games={games} marginTop='32px'/>
      }
    </Page>
  )
}

export default MainPage;