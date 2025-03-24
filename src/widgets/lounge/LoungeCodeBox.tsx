import { CopyIcon } from '@chakra-ui/icons';
import { Flex, FlexProps, IconButton, Text } from '@chakra-ui/react';
import React from 'react';

type Props = FlexProps & {
  code: string;
  onClickCopyButton: () => void;
};

export const LoungeCodeBox: React.FC<Props> = ({ code, onClickCopyButton, ...props }) => {
  return (
    <Flex gap='2' {...props}>
      <Flex height='12' align='center' paddingX='6' background='gray.100' borderRadius='md'>
        <Text>게임방 코드</Text>
        <Text paddingX='2' size='lg'>
          |
        </Text>
        <Text fontWeight='bold'>{code}</Text>
      </Flex>
      <IconButton
        onClick={onClickCopyButton}
        aria-label='Copy'
        icon={<CopyIcon />}
        width='12'
        height='12'
      />
    </Flex>
  );
};
