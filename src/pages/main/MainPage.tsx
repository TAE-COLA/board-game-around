import { Box } from '@chakra-ui/react';
import { useMainIntent } from 'pages';
import React from 'react';
import { GameCardGrid, GameEntryModal, GreetingUser, Header, Page } from 'widgets';

export const MainPage: React.FC = () => {
  const { state, loading, modal, onEvent } = useMainIntent();

  return (
    <Page loading={loading}>
      <Header>
        <GreetingUser onClickLogoutButton={onEvent.onClickLogoutButton} />
      </Header>
      {!state.gameList || state.gameList.length === 0 ? (
        <Box>No games found.</Box>
      ) : (
        <GameCardGrid
          gameList={state.gameList}
          onClickGamePlayButton={onEvent.onClickGamePlayButton}
          marginTop='32px'
        />
      )}
      {state.selectedGame && (
        <GameEntryModal
          loading={loading}
          modal={modal.gameEntryModal}
          game={state.selectedGame}
          onClickCreateLoungeButton={onEvent.onClickCreateLoungeButton}
          onClickJoinLoungeButton={onEvent.onClickJoinLoungeButton}
        />
      )}
    </Page>
  );
};
