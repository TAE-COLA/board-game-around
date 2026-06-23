import { Flex, FlexProps, Text } from '@chakra-ui/react';
import React from 'react';
import { RegisterButton } from './RegisterButton';

type IProps = FlexProps & {
  children: React.ReactNode;
  onClickRegisterButton: () => void;
};

export const LoginContainer: React.FC<IProps> = ({ children, onClickRegisterButton, ...props }) => {
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
      <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight='bold' textAlign='center'>
        🎲 우니의 보드게임천국 🎲
      </Text>
      {children}
      <RegisterButton onClickRegisterButton={onClickRegisterButton} />
    </Flex>
  );
};
