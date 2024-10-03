import { Button, Flex, FlexProps, Text } from '@chakra-ui/react';
import React from 'react';

type IProps = FlexProps & {
  rolls: number;
  rolling: boolean;
  onClickRollButton: () => void;
};

const YachtDiceButtons: React.FC<IProps> = ({
  rolls,
  rolling,
  onClickRollButton,
  ...props
}) => {
  return (
    <Flex width='100%' direction='column' gap='2' align='center' {...props}>
      <Text>남은 횟수: {rolls}</Text>
      <Button onClick={onClickRollButton} width='100%' colorScheme='blue' isDisabled={rolling || rolls === 0}>주사위 굴리기!</Button>
    </Flex>
  );
}

export default YachtDiceButtons;