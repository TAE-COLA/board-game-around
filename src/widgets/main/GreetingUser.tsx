import { Button, Flex, FlexProps, Text } from '@chakra-ui/react';
import { User } from 'firebase/auth';
import React from 'react';

type IProps = FlexProps & {
  user: User | null;
  onClickLogoutButton: () => void;
}

const GreetingUser: React.FC<IProps> = ({ 
  user,
  onClickLogoutButton,
  ...props 
}) => {
  if (!user) return <div />
  else return (
    <Flex alignItems="center" gap="4" {...props}>
      <Text>반갑습니다, {user.displayName}님!</Text>
      <Button onClick={onClickLogoutButton}>로그아웃</Button>
    </Flex>
  );
}

export default GreetingUser;