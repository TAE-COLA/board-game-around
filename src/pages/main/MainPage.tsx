import { Box } from '@chakra-ui/react';
import { useFetchGameList } from 'features';
import React from 'react';
import { GameCardGrid, Header } from 'widgets';

const MainPage: React.FC = () => {
  const { data: games } = useFetchGameList();

  return (
    <Box maxWidth="100%" paddingX="64px" paddingTop="32px">
      <Header onClickLoginButton={() => {}} />
      {!games || games.length === 0 ? 
        <Box>No games found.</Box> : 
        <GameCardGrid games={games} marginTop='32px'/>
      }
    </Box>
  )
}

export default MainPage;