import { Flex } from '@chakra-ui/react';
import { PageProps, Paths, useAuthContext } from 'app';
import React, { useEffect } from 'react';
import { NumberModal, Page } from 'shared/ui';
import { DavinciCodeBody, DavinciCodeFooter, DavinciCodeHeader } from '../ui';
import { DavinciCodeDrawModal } from './DrawModal.modal';
import { useDavinciCodeIntent } from './useDavinciCodeIntent';

export const DavinciCodePage: React.FC<PageProps> = ({ navigate, toast }) => {
  const { id: authId } = useAuthContext();
  const { state, loading, modal, onEvent, sideEffect } = useDavinciCodeIntent();

  useEffect(() => {
    switch (sideEffect?.type) {
      case 'NAVIGATE_TO_MAIN':
        navigate(Paths.main);
        break;
      case 'SHOW_TOAST':
        toast(sideEffect.options);
        break;
    }
  }, [sideEffect]);

  return (
    <Page loading={loading} minHeight='100dvh'>
      <Flex direction='column' width='100%' height='100%' gap={8}>
        <DavinciCodeHeader onClickExitButton={onEvent.onClickExitButton} />
        <DavinciCodeBody
          players={state.players}
          hands={state.hands}
          turn={state.turn}
          phase={state.phase}
          finishedPlayers={state.finishedPlayers}
          onClickTile={onEvent.onClickTile}
          flex={1}
        />
        <DavinciCodeFooter hand={state.hands[authId]} turn={state.turn} phase={state.phase} />
      </Flex>
      <DavinciCodeDrawModal
        hand={state.hands[authId]}
        drawableTiles={state.drawableTiles}
        pendingTiles={state.pendingTiles}
        onClickDrawButton={onEvent.onClickDrawButton}
        onSubmitHand={onEvent.onSubmitHand}
        modal={modal.drawModal}
      />
      <NumberModal
        digits={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, '-']}
        maxDigits={1}
        onConfirm={() => {}}
        modal={modal.numberModal}
      />
    </Page>
  );
};
