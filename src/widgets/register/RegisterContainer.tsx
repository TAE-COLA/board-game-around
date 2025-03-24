import { Flex, FlexProps, Text } from '@chakra-ui/react';
import React from 'react';

type Props = FlexProps & {
  children: React.ReactNode;
};

export const RegisterContainer: React.FC<Props> = ({ children, ...props }) => {
  return (
    <Flex
      flexDirection='column'
      height='100%'
      justifyContent='Center'
      alignItems='Center'
      gap='36px'
      {...props}
    >
      <Text fontSize='2xl' fontWeight='bold'>
        회원가입
      </Text>
      {children}
    </Flex>
  );
};
