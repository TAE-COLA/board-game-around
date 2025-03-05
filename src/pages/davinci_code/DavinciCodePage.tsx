import { Flex } from '@chakra-ui/react';
import { useLoungeContext } from 'features';
import React from 'react';
import {
  DavinciCodeBody,
  DavinciCodeFooter,
  DavinciCodeHeader,
  NumberModal,
  Page,
} from 'widgets';
import { useDavinciCodeIntent } from './useDavinciCodeIntent';

const DavinciCodePage: React.FC = () => {
  const { state, loading, modal, onEvent } = useDavinciCodeIntent();
  const lounge = useLoungeContext();

  return (
    <Page loading={loading} height='100vh'>
      <Flex direction='column' width='100%' height='100%' gap='8'>
        <DavinciCodeHeader
          onClickExitButton={() => onEvent({ type: 'ON_CLICK_EXIT_BUTTON' })}
        />
        <DavinciCodeBody
          players={state.players}
          hands={state.hands}
          turn={state.turn}
          finishedPlayers={state.finishedPlayers}
          onClickTile={(player, index) =>
            onEvent({ type: 'ON_CLICK_TILE', player, index })
          }
          flex='1'
        />
        <DavinciCodeFooter hands={state.hands} />
      </Flex>
      <NumberModal
        digits={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]}
        maxDigits={1}
        onConfirm={() => {}}
        modal={modal.numberModal}
      />
    </Page>
  );
};

export default DavinciCodePage;
