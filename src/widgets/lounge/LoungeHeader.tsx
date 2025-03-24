import { Button, Flex, FlexProps } from '@chakra-ui/react';
import { useLoungeContext } from 'app';
import React from 'react';
import { LoungeCodeBox } from 'widgets';

type Props = FlexProps & {
  onClickCopyButton: () => void;
  onClickExitButton: () => void;
};

export const LoungeHeader: React.FC<Props> = ({
  onClickCopyButton,
  onClickExitButton,
  ...props
}) => {
  const lounge = useLoungeContext();

  return (
    <Flex width='100%' {...props}>
      <LoungeCodeBox code={lounge.code} onClickCopyButton={onClickCopyButton} width='100%' />
      <Button onClick={onClickExitButton} height='12' paddingX='6'>
        게임방 나가기
      </Button>
    </Flex>
  );
};
