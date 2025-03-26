import { Flex } from '@chakra-ui/react';
import { PageProps } from 'app';
import React, { useEffect } from 'react';
import { Page, YachtDiceBody, YachtDiceHeader } from 'widgets';
import { YachtDiceResultModal } from './ResultModal.modal';
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
          yachtDice={state.yachtDice}
          currentBoardPlayer={state.currentBoardPlayer}
          kept={state.kept}
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
        rank={state.yachtDice.players.map((player) => ({ player, score: 0 }))}
        modal={modal.resultModal}
      />
    </Page>
  );
};
