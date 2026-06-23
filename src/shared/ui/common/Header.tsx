import { Flex, FlexProps, Text } from '@chakra-ui/react';
import React from 'react';

type IProps = FlexProps & {
  children?: React.ReactNode;
};

export const Header: React.FC<IProps> = ({ children, ...props }) => {
  return (
    <Flex
      justify='space-between'
      align='center'
      gap={4}
      paddingX={{ base: 4, md: 8 }}
      paddingY={{ base: 3, md: 4 }}
      bg='white'
      borderRadius='8px'
      {...props}
    >
      <Text as='b' fontSize={{ base: 'lg', md: '2xl' }} flexShrink={0}>
        우니의 보드게임천국
      </Text>
      {children}
    </Flex>
  );
};
