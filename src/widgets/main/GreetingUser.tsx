import { Button, Flex, FlexProps, Text } from '@chakra-ui/react';
import { useAuthContext } from 'features';
import React from 'react';

type IProps = FlexProps & {
  onClickLogoutButton: () => void;
}

const GreetingUser: React.FC<IProps> = ({ 
  onClickLogoutButton,
  ...props 
}) => {
  const auth = useAuthContext();

  return (
    <Flex alignItems="center" gap="4" {...props}>
      <Text>반갑습니다, {auth.name}님!</Text>
      <Button onClick={onClickLogoutButton}>로그아웃</Button>
    </Flex>
  );
}

export default GreetingUser;