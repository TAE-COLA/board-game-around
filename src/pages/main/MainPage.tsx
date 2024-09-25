import { Box } from '@chakra-ui/react';
import { useMainIntent } from 'pages';
import React from 'react';
import { GameCardGrid, GameEntryModal, GreetingUser, Header, Page } from 'widgets';

const MainPage: React.FC = () => {
  const intent = useMainIntent();

  return (
    <Page loading= {intent.loading}>
      <Header>
        <GreetingUser
          user={intent.auth.user}
          onClickLogoutButton={() => intent.onEvent({ type: 'ON_CLICK_LOGOUT_BUTTON' })}
        />
      </Header>
      {!intent.state.gameList || intent.state.gameList.length === 0 ? 
        <Box>No games found.</Box> : 
        <GameCardGrid 
          gameList={intent.state.gameList} 
          onClickGamePlayButton={game => intent.onEvent({ type: 'ON_CLICK_GAME_PLAY_BUTTON', game })}
          marginTop='32px'
        />
      }
      {intent.state.selectedGame &&
        <GameEntryModal 
          loading={intent.loading}
          modal={intent.modal} 
          game={intent.state.selectedGame} 
          onClickCreateLoungeButton={() => intent.onEvent({ type: 'ON_CLICK_CREATE_LOUNGE_BUTTON' })}
          onClickJoinLoungeButton={code => intent.onEvent({ type: 'ON_CLICK_JOIN_LOUNGE_BUTTON', code })}
        />
      }
    </Page>
  )
}

export default MainPage;