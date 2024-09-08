import { Divider as ChakraDivider, Flex, FlexProps, Text } from '@chakra-ui/react';
import React from 'react';

type IProps = FlexProps & {
  text?: string;

};

const Divider: React.FC<IProps> = ({
  text,
  ...props
}) => {
  return (
    <Flex align='center' gap={text && '4'} {...props}>
      <ChakraDivider flex='1' />
      {text && <Text>{text}</Text>}
      <ChakraDivider flex='1' />
    </Flex>
  );
};

export default Divider;