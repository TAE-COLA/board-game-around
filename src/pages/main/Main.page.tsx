import { PageProps, Paths } from 'app';
import React, { useEffect } from 'react';
import { Dimension } from 'shared';
import { GameCardGrid, MainHeader, Page } from 'widgets';
import { GameEntryModal } from './GameEntryModal.modal';
import { SideEffects } from './Main.intent';
import { useMainIntent } from './useMainIntent.hook';

export const MainPage: React.FC<PageProps> = ({ navigate, toast }) => {
  const { state, loading, modal, onEvent, sideEffect } = useMainIntent();

  useEffect(() => {
    switch (sideEffect?.type) {
      case SideEffects.NAVIGATE_TO_LOGIN:
        navigate(Paths.login);
        break;
      case SideEffects.NAVIGATE_TO_LOUNGE:
        navigate(Paths.lounge);
        break;
      case SideEffects.SHOW_TOAST:
        toast(sideEffect.options);
        break;
    }
  }, [sideEffect]);

  return (
    <Page loading={loading} height={Dimension.ScreenHeight}>
      <MainHeader onClickLogoutButton={onEvent.onClickLogoutButton} />
      <GameCardGrid
        gameList={state.gameList}
        onClickGamePlayButton={onEvent.onClickGamePlayButton}
        paddingTop={8}
      />
      <GameEntryModal
        modal={modal.gameEntryModal}
        game={state.selectedGame}
        onClickCreateLoungeButton={onEvent.onClickCreateLoungeButton}
        onClickJoinLoungeButton={onEvent.onClickJoinLoungeButton}
      />
    </Page>
  );
};
