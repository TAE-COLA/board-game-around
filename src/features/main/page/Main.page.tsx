import { Box } from '@chakra-ui/react';
import { PageProps } from 'app';
import React, { useEffect } from 'react';
import { Header, Page } from 'shared/ui';
import { GameCardGrid, GameEntryModal, GreetingUser } from '../ui';
import { useMainIntent } from './useMainIntent';

export const MainPage: React.FC<PageProps> = ({ navigate, toast }) => {
  const { state, loading, actionPending, clearSideEffects, modal, onEvent, sideEffects } =
    useMainIntent();

  useEffect(() => {
    if (sideEffects.length === 0) return;

    sideEffects.forEach((sideEffect) => {
      switch (sideEffect.type) {
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
    });
    clearSideEffects();
  }, [clearSideEffects, navigate, sideEffects, toast]);

  return (
    <Page loading={loading}>
      <Header>
        <GreetingUser
          logoutLoading={!!actionPending.logout}
          onClickLogoutButton={onEvent.onClickLogoutButton}
        />
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
          createLoading={!!actionPending.createLounge}
          joinLoading={!!actionPending.joinLounge}
          modal={modal.gameEntryModal}
          game={state.selectedGame}
          onClickCreateLoungeButton={onEvent.onClickCreateLoungeButton}
          onClickJoinLoungeButton={onEvent.onClickJoinLoungeButton}
        />
      )}
    </Page>
  );
};
