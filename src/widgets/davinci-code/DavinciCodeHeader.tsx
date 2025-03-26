import { Button, Flex, FlexProps, Text } from '@chakra-ui/react';
import React from 'react';

type Props = FlexProps & {
  onClickExitButton: () => void;
};

export const DavinciCodeHeader: React.FC<Props> = ({ onClickExitButton, ...props }) => {
  return (
    <Flex width='100%' justify='space-between' align='center' {...props}>
      <Text fontSize='2xl' fontWeight='bold'>
        다빈치코드
      </Text>
      <Button onClick={onClickExitButton} height={12} paddingX={6}>
        게임방 나가기
      </Button>
    </Flex>
  );
};
