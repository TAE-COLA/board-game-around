import { Flex, FlexProps, Text } from '@chakra-ui/react';
import React from 'react';

type IProps = FlexProps & {
  children: React.ReactNode;
}

const RegisterContainer: React.FC<IProps> = ({
  children,
  ...props
}) => {
  return (
    <Flex flexDirection="column" height="100%" justifyContent="Center" alignItems="Center" gap="36px" {...props}>
      <Text fontSize="2xl" fontWeight="bold">회원가입</Text>
      {children}
    </Flex>
  );
}

export default RegisterContainer;