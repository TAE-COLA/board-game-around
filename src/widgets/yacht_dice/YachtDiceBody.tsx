import { Box, Button, Flex, FlexProps } from '@chakra-ui/react';
import { User, YachtDiceBoard } from 'entities';
import React, { useState } from 'react';
import { DiceRow, PlayerList, YachtBoard } from 'widgets';

type IProps = FlexProps & {
  players: User[];
  boards: {
    [key: string]: YachtDiceBoard;
  };
  turn: User;
  dice: number[];
  keep: boolean[];
  rolls: number;
};

const YachtDiceBody: React.FC<IProps> = ({
  players,
  boards,
  turn,
  dice,
  keep,
  rolls,
  ...props
}) => {
  const boardOf = (player: User) => boards[player.id];
  const scoreOf = (player: User) => 0;

  const [rolling, setRolling] = useState<boolean>(false);
  const onRoll = () => {
    setRolling(true);
  }
  const onResult = (values: number[]) => {
    console.log('values:', values);
    setRolling(false);
  }

  return (
    <Flex width='100%' gap='8' {...props}>
      <YachtBoard player={turn} board={boardOf(turn)} score={scoreOf(turn)} />
      <Box flex='2'>
        <DiceRow dice={dice} keep={keep} rolling={rolling} onResult={onResult}/>
      </Box>
      <Flex direction='column' gap='4' flex='1'>
        <PlayerList players={players} flex='1' />
        <Flex width='100%' gap='4'>
          <Button colorScheme='blue' flex='1' onClick={onRoll}>주사위 굴리기!</Button>
          <Button flex='1'>턴 종료</Button>
        </Flex>
      </Flex>
    </Flex>
  )
};

export default YachtDiceBody;