import { Box } from '@chakra-ui/react';
import { useFetchGameList } from 'features';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GameCardGrid, Header } from 'widgets';

const MainPage: React.FC = () => {
  const navigate = useNavigate();
  const navigateToLogin = () => {
    navigate('/login');
  }

  const { data: games } = useFetchGameList();

  return (
    <Box maxWidth="100%" paddingX="64px" paddingTop="32px">
      <Header onClickLoginButton={navigateToLogin} />
      {!games || games.length === 0 ? 
        <Box>No games found.</Box> : 
        <GameCardGrid games={games} marginTop='32px'/>
      }
    </Box>
  )
}

export default MainPage;