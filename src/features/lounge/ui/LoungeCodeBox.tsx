import { CopyIcon } from '@chakra-ui/icons';
import { Flex, FlexProps, IconButton, Text } from '@chakra-ui/react';
import React from 'react';

type IProps = FlexProps & {
  code: string;
  onClickCopyButton: () => void;
};

export const LoungeCodeBox: React.FC<IProps> = ({ code, onClickCopyButton, ...props }) => {
  return (
    <Flex gap='2' minWidth={0} {...props}>
      <Flex
        height={{ base: 10, md: 12 }}
        align='center'
        paddingX={{ base: 3, md: 6 }}
        background='gray.100'
        borderRadius='md'
        flex='1'
        minWidth={0}
      >
        <Text flexShrink={0} fontSize={{ base: 'sm', md: 'md' }}>
          게임방 코드
        </Text>
        <Text paddingX={{ base: 1.5, md: 2 }} size='lg' flexShrink={0}>
          |
        </Text>
        <Text fontWeight='bold' noOfLines={1} minWidth={0} fontSize={{ base: 'sm', md: 'md' }}>
          {code}
        </Text>
      </Flex>
      <IconButton
        onClick={onClickCopyButton}
        aria-label='Copy'
        icon={<CopyIcon />}
        width={{ base: 10, md: 12 }}
        height={{ base: 10, md: 12 }}
        flexShrink={0}
      />
    </Flex>
  );
};
