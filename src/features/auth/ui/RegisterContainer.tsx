import { Flex, FlexProps, Text } from '@chakra-ui/react';
import React from 'react';

type IProps = FlexProps & {
  children: React.ReactNode;
};

export const RegisterContainer: React.FC<IProps> = ({ children, ...props }) => {
  return (
    <Flex
      flexDirection='column'
      minHeight={{ base: 'calc(100dvh - 16px)', md: 'calc(100dvh - 64px)' }}
      justifyContent='center'
      alignItems='center'
      gap={{ base: 6, md: 9 }}
      width='100%'
      {...props}
    >
      <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight='bold'>
        회원가입
      </Text>
      {children}
    </Flex>
  );
};
