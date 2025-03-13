import { Flex } from '@chakra-ui/react';
import { useLoungeIntent } from 'pages';
import React from 'react';
import { LoungeBody, LoungeHeader, Page } from 'widgets';

export const LoungePage: React.FC = () => {
  const { loading, onEvent } = useLoungeIntent();

  return (
    <Page loading={loading} height='100vh'>
      <Flex direction='column' width='100%' height='100%' gap={8}>
        <LoungeHeader onClickCopyButton={onEvent.onClickCopyButton} onClickExitButton={onEvent.onClickExitButton} />
        <LoungeBody onClickStartButton={onEvent.onClickStartButton} flex={1} />
      </Flex>
    </Page>
  );
};
