import { Flex } from '@chakra-ui/react';
import { PageProps, Paths } from 'app';
import React, { useEffect } from 'react';
import { LoungeBody, LoungeHeader, Page } from 'widgets';
import { useLoungeIntent } from './useLoungeIntent';

export const LoungePage: React.FC<PageProps> = ({ navigate, toast }) => {
  const { loading, onEvent, sideEffect } = useLoungeIntent();

  useEffect(() => {
    switch (sideEffect?.type) {
      case 'POP_BACK_STACK':
        navigate(-1);
        break;
      case 'NAVIGATE_TO_YACHT_DICE':
        navigate(Paths.yachtDice, { replace: true });
        break;
      case 'NAVIGATE_TO_DAVINCI_CODE':
        navigate(Paths.davinciCode, { replace: true });
        break;
      case 'COPY_CLIPBOARD':
        navigator.clipboard.writeText(sideEffect.value);
        break;
      case 'SHOW_TOAST':
        toast(sideEffect.options);
        break;
    }
  }, [sideEffect]);

  return (
    <Page loading={loading} height='100vh'>
      <Flex direction='column' width='100%' height='100%' gap={8}>
        <LoungeHeader
          onClickCopyButton={onEvent.onClickCopyButton}
          onClickExitButton={onEvent.onClickExitButton}
        />
        <LoungeBody onClickStartButton={onEvent.onClickStartButton} flex={1} />
      </Flex>
    </Page>
  );
};
