import { Button, Flex, FlexProps } from '@chakra-ui/react';
import React from 'react';
import { LoungeCodeBox } from 'widgets';

type IProps = FlexProps & {
  code: string;
  onClickCopyButton: () => void;
  onClickExitButton: () => void;
};

const LoungeHeader: React.FC<IProps> = ({
  code,
  onClickCopyButton,
  onClickExitButton,
  ...props
}) => {
  return (
    <Flex width='100%' {...props}>
      <LoungeCodeBox code={code} onClickCopyButton={onClickCopyButton} width='100%' />
      <Button onClick={onClickExitButton} height='12' paddingX='6'>게임방 나가기</Button>
    </Flex>
  )
};

export default LoungeHeader;