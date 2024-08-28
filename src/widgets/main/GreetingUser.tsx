import { Button, Flex, FlexProps, Text } from '@chakra-ui/react';
import { useAuth } from 'features';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { showToast } from 'widgets';

const GreetingUser: React.FC<FlexProps> = ({ ...props }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const logoutAndNavigate = () => {
    logout();
    navigate('/login', { replace: true });
    showToast({ title: '로그아웃', body: '정상적으로 로그아웃되었습니다.' });
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