import { Button, Flex, FlexProps, Text } from '@chakra-ui/react';
import React from 'react';

type IProps = FlexProps & {
  onClickRegisterButton: () => void;
};

export const RegisterButton: React.FC<IProps> = ({ onClickRegisterButton, ...props }) => {
  return (
    <Flex direction={{ base: 'column', sm: 'row' }} alignItems='center' gap={2} {...props}>
      <Text fontSize='sm'>
        계정이 없으신가요?
      </Text>
      <Button onClick={onClickRegisterButton} size='sm'>
        회원가입
      </Button>
    </Flex>
  );
};
