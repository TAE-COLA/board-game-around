import { Flex, FlexProps, Text } from '@chakra-ui/react';
import React from 'react';

type Props = FlexProps & {
  round: number;
};

export const YachtDiceRoundBox: React.FC<Props> = ({ round, ...props }) => {
  return (
    <Flex
      width='100%'
      justify='center'
      align='center'
      paddingY='2'
      background='gray.100'
      borderRadius='md'
      {...props}
    >
      <Text fontWeight='bold'>{round} 라운드</Text>
    </Flex>
  );
};
