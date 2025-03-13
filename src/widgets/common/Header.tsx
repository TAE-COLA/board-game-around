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
      paddingX='32px'
      paddingY='16px'
      bg='white'
      borderRadius='8px'
      {...props}
    >
      <Text as='b' fontSize='2xl'>
        우니의 보드게임천국
      </Text>
      {children}
    </Flex>
  );
};
