import { Flex } from '@chakra-ui/react';
import { PageProps } from 'app';
import React, { useEffect } from 'react';
import { Page, YachtDiceBody, YachtDiceHeader, YachtDiceResultModal } from 'widgets';
import { useYachtDiceIntent } from './useYachtDiceIntent';

export const YachtDicePage: React.FC<PageProps> = ({ navigate, toast }) => {
  const { state, loading, modal, onEvent, sideEffect } = useYachtDiceIntent();

  useEffect(() => {
    switch (sideEffect?.type) {
      case 'POP_BACK_STACK':
        navigate(-1);
        break;
      case 'SHOW_TOAST':
        toast(sideEffect.options);
        break;
    }
  }, [sideEffect]);

  return (
    <Page loading={loading} height='100vh'>
      <Flex direction='column' width='100%' height='100%' gap={8}>
        <YachtDiceHeader onClickExitButton={onEvent.onClickExitButton} />
        <YachtDiceBody
          players={state.players}
          round={state.round}
          boards={state.boards}
          currentBoardPlayer={state.currentBoardPlayer}
          turn={state.turn}
          dice={state.dice}
          kept={state.kept}
          keep={state.keep}
          rolls={state.rolls}
          rolling={state.rolling}
          onClickPrevBoardButton={onEvent.onClickPrevBoardButton}
          onClickNextBoardButton={onEvent.onClickNextBoardButton}
          onClickRollButton={onEvent.onClickRollButton}
          onRollFinish={onEvent.onRollFinish}
          onAddDiceToKeep={onEvent.onAddDiceToKeep}
          onRemoveDiceToKeep={onEvent.onRemoveDiceToKeep}
          onClickSelectHandButton={onEvent.onClickSelectHandButton}
          flex={1}
        />
      </Flex>
      <YachtDiceResultModal
        rank={state.players.map((player) => ({ player, score: 0 }))}
        modal={modal.resultModal}
      />
    </Page>
  );
};
