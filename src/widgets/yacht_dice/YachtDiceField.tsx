import { Box, Flex, FlexProps, Text } from '@chakra-ui/react';
import React from 'react';
import { DiceRow } from 'widgets';

type IProps = FlexProps & {
  dice: number[];
  keep: boolean[];
  rolling: boolean;
  onResult: (values: number[]) => void;
};

const YachtDiceField: React.FC<IProps> = ({
  dice,
  keep,
  rolling,
  onResult,
  ...props
}) => {
  return (
    <Flex direction='column' align='center' gap='10' {...props}>
      <DiceRow dice={dice} keep={keep} rolling={rolling} onResult={onResult} />
      <Flex direction='column' align='center' gap='4'>
        <Box width='400px' height='80px' border='2px' borderColor='black' borderRadius='md' borderStyle='dashed' />
        <Text>고정하고 싶은 주사위를 아래로 드래그해주세요.</Text>
      </Flex>
    </Flex>
  );
}

export default YachtDiceField;