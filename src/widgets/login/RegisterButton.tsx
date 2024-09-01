import { Button, Flex, FlexProps, Text } from '@chakra-ui/react';
import React from 'react';

type IProps = FlexProps & {
  onClickRegisterButton: () => void;
}

const RegisterButton: React.FC<IProps> = ({
  onClickRegisterButton,
  ...props
}) => {
  return (
    <Flex direction='row' alignItems='Center' {...props}>
      <Text fontSize="sm" paddingRight='2'>계정이 없으신가요?</Text>
      <Button onClick={onClickRegisterButton} size='sm'>회원가입</Button>
    </Flex>
  );
}

export default RegisterButton;