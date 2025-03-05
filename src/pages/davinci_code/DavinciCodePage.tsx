import { Flex } from '@chakra-ui/react';
import { useLoungeContext } from 'features';
import React from 'react';
import {
  DavinciCodeBody,
  DavinciCodeFooter,
  DavinciCodeHeader,
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
          flex='1'
        />
        <DavinciCodeFooter hands={state.hands} />
      </Flex>
    </Page>
  );
};

export default DavinciCodePage;
