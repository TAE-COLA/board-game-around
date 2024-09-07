import { Button, Flex, FlexProps, Text } from '@chakra-ui/react';
import React from 'react';

type IProps = FlexProps & {
  rolls: number;
  rolling: boolean;
  onClickRollButton: () => void;
  onClickEndTurnButton: () => void;
};

const YachtDiceButtons: React.FC<IProps> = ({
  rolls,
  rolling,
  onClickRollButton,
  onClickEndTurnButton,
  ...props
}) => {
  return (
    <Flex width='100%' gap='4' align='end' {...props}>
      <Flex direction='column' gap='2' align='center' flex='1'>
        <Text>남은 횟수: {rolls}</Text>
        <Button onClick={onClickRollButton} width='100%' colorScheme='blue' isDisabled={rolling}>주사위 굴리기!</Button>
      </Flex>
      <Button onClick={onClickEndTurnButton} flex='1' isDisabled={rolling}>턴 종료</Button>
    </Flex>
  );
}

export default YachtDiceButtons;