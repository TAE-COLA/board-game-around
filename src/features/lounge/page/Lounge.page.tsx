import { Flex } from '@chakra-ui/react';
import { PageProps, Paths } from 'app';
import React, { useEffect } from 'react';
import { CommonToast } from 'shared';
import { Page } from 'shared/ui';
import { LoungeBody, LoungeHeader } from '../ui';
import { useLoungeIntent } from './useLoungeIntent';

const copyText = async (value: string) => {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = value;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const copied = document.execCommand('copy');
    document.body.removeChild(textarea);
    return copied;
  }
};

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
      case 'NAVIGATE_TO_THE_MIND':
        navigate(Paths.theMind, { replace: true });
        break;
      case 'COPY_CLIPBOARD':
        copyText(sideEffect.value).then((copied) => {
          toast(copied ? CommonToast.COPY_LOUNGE_CODE : CommonToast.COPY_LOUNGE_CODE_FAILED);
        });
        break;
      case 'SHOW_TOAST':
        toast(sideEffect.options);
        break;
    }
  }, [sideEffect]);

  return (
    <Page loading={loading} minHeight='100dvh'>
      <Flex direction='column' width='100%' minHeight='100%' gap={{ base: 4, md: 8 }} paddingBottom={4}>
        <LoungeHeader
          onClickCopyButton={onEvent.onClickCopyButton}
          onClickExitButton={onEvent.onClickExitButton}
        />
        <LoungeBody onClickStartButton={onEvent.onClickStartButton} flex={1} />
      </Flex>
    </Page>
  );
};
