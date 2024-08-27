import { Box, BoxProps, Button, Text } from '@chakra-ui/react';
import { useAuth } from 'features';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontSize } from 'shared';

const Header: React.FC<BoxProps> = ({ ...props }) => {
  const { user } = useAuth();

  const navigate = useNavigate();
  const navigateToLogin = () => {
    navigate('/login');
  }

  return (
    <Box display="flex" justifyContent="space-between" alignItems="center" paddingX="32px" paddingY="16px" bg="white" borderRadius="8px" {...props}>
      <Text as="b" fontSize={FontSize["2XL"]}>우니의 보드게임천국</Text>
      {user ? <Text>반갑습니다, {user.displayName}님!</Text> : <Button onClick={navigateToLogin}>로그인</Button>}
    </Box>
  );
}

export default Header;