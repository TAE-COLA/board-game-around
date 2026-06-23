import { Button, Flex, FlexProps } from '@chakra-ui/react';
import { useLoungeContext } from 'app';
import React from 'react';
import { LoungeCodeBox } from './LoungeCodeBox';

type IProps = FlexProps & {
  onClickCopyButton: () => void;
  onClickExitButton: () => void;
};

export const LoungeHeader: React.FC<IProps> = ({
  onClickCopyButton,
  onClickExitButton,
  ...props
}) => {
  const lounge = useLoungeContext();

  return (
    <Flex width='100%' direction={{ base: 'column', sm: 'row' }} gap={2} {...props}>
      <LoungeCodeBox code={lounge.code} onClickCopyButton={onClickCopyButton} flex='1' minWidth={0} />
      <Button
        onClick={onClickExitButton}
        height={{ base: 10, md: 12 }}
        paddingX={{ base: 4, md: 6 }}
        width={{ base: '100%', sm: 'auto' }}
      >
        게임방 나가기
      </Button>
    </Flex>
  );
};
