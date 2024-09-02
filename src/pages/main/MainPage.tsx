import { Box } from '@chakra-ui/react';
import { useMainIntent } from 'pages';
import React, { useEffect } from 'react';
import { GameCardGrid, GameEntryModal, GreetingUser, Header, Page } from 'widgets';

const MainPage: React.FC = () => {
  const { state, modal, onEvent } = useMainIntent();

  useEffect(() => {
    onEvent({ type: 'SCREEN_INITIALIZE' });
  }, []);

  return (
    <Page loading= {state.loading}>
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
      {state.selectedGame &&
        <GameEntryModal 
          loading={state.loading}
          modal={modal} 
          game={state.selectedGame} 
          onClickCreateLoungeButton={() => onEvent({ type: 'ON_CLICK_CREATE_LOUNGE_BUTTON' })}
          onClickJoinLoungeButton={code => onEvent({ type: 'ON_CLICK_JOIN_LOUNGE_BUTTON', code })}
        />
      }
    </Page>
  )
}

export default MainPage;