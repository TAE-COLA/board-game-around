import { Box } from '@chakra-ui/react';
import { PageProps } from 'app';
import React, { useEffect } from 'react';
import { GameCardGrid, GameEntryModal, GreetingUser, Header, Page } from 'widgets';
import { useMainIntent } from './useMainIntent';

export const MainPage: React.FC<PageProps> = ({ navigate, toast }) => {
  const { state, loading, modal, onEvent, sideEffect } = useMainIntent();

  useEffect(() => {
    switch (sideEffect?.type) {
      case 'NAVIGATE_TO_LOGIN':
        navigate('login');
        break;
      case 'NAVIGATE_TO_LOUNGE':
        navigate('lounge');
        break;
      case 'SHOW_TOAST':
        toast(sideEffect.options);
        break;
    }
  }, [sideEffect]);

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
