import { Button, Flex, FlexProps, Text } from '@chakra-ui/react';
import { useAuthContext } from 'app';
import React from 'react';
import { Align, Colors, FontWeight, Size } from 'shared';

type Props = FlexProps & {
  onClickLogoutButton: () => void;
};

export const MainHeader: React.FC<Props> = ({ onClickLogoutButton, ...props }) => {
  const { name } = useAuthContext();

  return (
    <Flex
      justify={Align.SpaceBetween}
      align={Align.Center}
      paddingX={8}
      paddingY={4}
      background={Colors.White}
      borderRadius={8}
      {...props}
    >
      <Text fontSize={Size.XXL} fontWeight={FontWeight.Bold}>
        우니의 보드게임천국
      </Text>
      <Flex align={Align.Center} gap={4} {...props}>
        <Text>반갑습니다, {name}님!</Text>
        <Button onClick={onClickLogoutButton}>로그아웃</Button>
      </Flex>
    </Flex>
  );
};
