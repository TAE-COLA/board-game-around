import { Flex } from '@chakra-ui/react';
import { useLoungeIntent } from 'pages';
import React from 'react';
import { LoungeBody, LoungeHeader, Page } from 'widgets';

const LoungePage: React.FC = () => {
  const { state, onEvent } = useLoungeIntent();

  return (
    <Page loading= {state.loading} height='100vh'>
      <Flex direction='column' width='100%' height='100%' gap='8'>
          <LoungeHeader
            code={state.code}
            onClickCopyButton={() => onEvent({ type: 'ON_CLICK_COPY_BUTTON' })}
            onClickExitButton={() => onEvent({ type: 'ON_CLICK_EXIT_BUTTON' })}
          />
          <LoungeBody 
            game={state.game} 
            members={state.members}
            owner={state.owner}
            onClickStartButton={() => onEvent({ type: 'ON_CLICK_START_BUTTON' })}
            flex='1' 
          />
        </Flex>
    </Page>
  )
}

export default LoungePage;