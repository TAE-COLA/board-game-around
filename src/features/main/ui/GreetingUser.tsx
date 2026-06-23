import { Button, Flex, FlexProps, Text } from '@chakra-ui/react';
import { useAuthContext } from 'app';
import React from 'react';

type IProps = FlexProps & {
  logoutLoading?: boolean;
  onClickLogoutButton: () => void;
};

export const GreetingUser: React.FC<IProps> = ({
  logoutLoading = false,
  onClickLogoutButton,
  ...props
}) => {
  const auth = useAuthContext();

  return (
    <Flex
      alignItems={{ base: 'stretch', sm: 'center' }}
      justifyContent='flex-end'
      direction={{ base: 'column', sm: 'row' }}
      gap={{ base: 2, md: 4 }}
      minWidth={0}
      {...props}
    >
      <Text noOfLines={1}>반갑습니다, {auth.name}님!</Text>
      <Button
        onClick={onClickLogoutButton}
        isDisabled={logoutLoading}
        isLoading={logoutLoading}
        size={{ base: 'sm', md: 'md' }}
      >
        로그아웃
      </Button>
    </Flex>
  );
};
