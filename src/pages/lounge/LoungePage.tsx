import { Flex } from '@chakra-ui/react';
import { useAuth, useLounge } from 'features';
import { useLoungeIntent } from 'pages';
import React from 'react';
import { LoungeBody, LoungeHeader, Page } from 'widgets';

const LoungePage: React.FC = () => {
  const { state, onEvent } = useLoungeIntent();
  const { user, loading: authLoading } = useAuth();
  const { loading: loungeLoading, exit,  ...lounge } = useLounge();

  return (
    <Page loading={state.loading} height='100vh'>
      <Flex direction='column' width='100%' height='100%' gap='8'>
          <LoungeHeader
            code={lounge.code}
            onClickCopyButton={() => onEvent({ type: 'ON_CLICK_COPY_BUTTON' })}
            onClickExitButton={() => onEvent({ type: 'ON_CLICK_EXIT_BUTTON' })}
          />
          <LoungeBody 
            game={lounge.game} 
            players={lounge.players}
            owner={lounge.owner}
            onClickStartButton={() => onEvent({ type: 'ON_CLICK_START_BUTTON' })}
            flex='1' 
          />
        </Flex>
    </Page>
  )
}

export default LoungePage;