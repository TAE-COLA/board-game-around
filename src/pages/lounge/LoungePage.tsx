import { Flex } from '@chakra-ui/react';
import { useLoungeIntent } from 'pages';
import React from 'react';
import { LoungeBody, LoungeHeader, Page } from 'widgets';

const LoungePage: React.FC = () => {
  const intent = useLoungeIntent();

  return (
    <Page loading={intent.loading} height='100vh'>
      <Flex direction='column' width='100%' height='100%' gap='8'>
          <LoungeHeader
            code={intent.lounge.code}
            onClickCopyButton={() => intent.onEvent({ type: 'ON_CLICK_COPY_BUTTON' })}
            onClickExitButton={() => intent.onEvent({ type: 'ON_CLICK_EXIT_BUTTON' })}
          />
          <LoungeBody 
            user={intent.auth.user}
            game={intent.lounge.game} 
            players={intent.lounge.players}
            owner={intent.lounge.owner}
            onClickStartButton={() => intent.onEvent({ type: 'ON_CLICK_START_BUTTON' })}
            flex='1' 
          />
        </Flex>
    </Page>
  )
}

export default LoungePage;