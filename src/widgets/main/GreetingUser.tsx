import { Button, Flex, FlexProps, Text, useToast } from '@chakra-ui/react';
import { useAuth } from 'features';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const GreetingUser: React.FC<FlexProps> = ({ ...props }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const logoutAndNavigate = () => {
    logout();
    navigate('/login', { replace: true });
    toast({
      title: '로그아웃',
      description: '정상적으로 로그아웃되었습니다.',
      status: 'info',
      duration: 9000,
      isClosable: true
    });
  }

  if (!user) return <div />
  else return (
    <Flex alignItems="center" gap="4" {...props}>
      <Text>반갑습니다, {user.displayName}님!</Text>
      <Button onClick={logoutAndNavigate}>로그아웃</Button>
    </Flex>
  );
}

export default GreetingUser;