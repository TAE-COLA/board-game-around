import { Box } from '@chakra-ui/react';
import { useMainIntent } from 'pages';
import React from 'react';
import { GameCardGrid, GreetingUser, Header, Page } from 'widgets';

const MainPage: React.FC = () => {
  const { state, onEvent } = useMainIntent();

  return (
    <Page>
      <Header>
        <GreetingUser
          user={state.user}
          onClickLogoutButton={() => onEvent({ type: 'ON_CLICK_LOGOUT_BUTTON' })}
        />
      </Header>
      {!state.gameList || state.gameList.length === 0 ? 
        <Box>No games found.</Box> : 
        <GameCardGrid 
          gameList={state.gameList} 
          onClickGamePlayButton={game => onEvent({ type: 'ON_CLICK_GAME_PLAY_BUTTON', game })}
          marginTop='32px'
        />
      }
    </Page>
  )
}

export default MainPage;