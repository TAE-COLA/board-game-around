import { Flex } from '@chakra-ui/react';
import { useYachtDiceIntent } from 'pages';
import React from 'react';
import { Page, YachtDiceBody, YachtDiceHeader } from 'widgets';

const YachtDicePage: React.FC = () => {
  const { state, onEvent } = useYachtDiceIntent();

  return (
    <Page loading={state.loading}>
      <Flex direction='column' width='100%' height='100%' gap='8'>
        <YachtDiceHeader onClickExitButton={() => onEvent({ type: 'ON_CLICK_EXIT_BUTTON' })} />
        <YachtDiceBody members={state.members} />
      </Flex>
    </Page>
  );
}

export default YachtDicePage;