import { Flex, FlexProps, Text } from '@chakra-ui/react';
import React from 'react';
import { RegisterButton } from 'widgets';

type IProps = FlexProps & {
  children: React.ReactNode;
  onClickRegisterButton: () => void;
};

const LoginContainer: React.FC<IProps> = ({
  children,
  onClickRegisterButton,
  ...props
}) => {
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
        🎲 우니의 보드게임천국 🎲
      </Text>
      {children}
      <RegisterButton onClickRegisterButton={onClickRegisterButton} />
    </Flex>
  );
};

export default LoginContainer;
