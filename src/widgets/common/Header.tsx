import { Flex, FlexProps, Text } from '@chakra-ui/react';
import React from 'react';
import { FontSize } from 'shared';

type IProps = FlexProps & {
  children?: React.ReactNode;
};

const Header: React.FC<IProps> = ({ 
  children,
  ...props
}) => {
  return (
    <Flex justifyContent="space-between" alignItems="center" paddingX="32px" paddingY="16px" bg="white" borderRadius="8px" {...props}>
      <Text as="b" fontSize={FontSize["2XL"]}>우니의 보드게임천국</Text>
      {children}
    </Flex>
  );
}

export default Header;