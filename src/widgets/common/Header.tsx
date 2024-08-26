import { Box, BoxProps, Button, Text } from '@chakra-ui/react';
import React from 'react';
import { FontSize } from 'shared';

type IProps = BoxProps & {
  onClickLoginButton: () => void;
}

const Header: React.FC<IProps> = ({
  onClickLoginButton,
  ...props
}) => {
  return (
    <Box 
      display="flex" 
      justifyContent="space-between" 
      alignItems="center" 
      paddingX="32px" 
      paddingY="16px" 
      backgroundColor="white" 
      borderRadius="8px" 
      {...props}
    >
      <Text as="b" fontSize={FontSize["2XL"]}>우니의 보드게임천국</Text>
      <Button onClick={onClickLoginButton}>로그인</Button>
    </Box>
  );
}

export default Header;