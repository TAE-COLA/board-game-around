import { Button, Flex, FlexProps } from '@chakra-ui/react';
import { useLoungeContext } from 'features';
import React from 'react';
import { LoungeCodeBox } from 'widgets';

type IProps = FlexProps & {
  onClickCopyButton: () => void;
  onClickExitButton: () => void;
};

const LoungeHeader: React.FC<IProps> = ({
  onClickCopyButton,
  onClickExitButton,
  ...props
}) => {
  const lounge = useLoungeContext();

  return (
    <Flex width='100%' {...props}>
      <LoungeCodeBox code={lounge.code} onClickCopyButton={onClickCopyButton} width='100%' />
      <Button onClick={onClickExitButton} height='12' paddingX='6'>게임방 나가기</Button>
    </Flex>
  )
};

export default LoungeHeader;