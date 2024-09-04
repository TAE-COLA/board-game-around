import { Box, Flex, FlexProps } from '@chakra-ui/react';
import { User } from 'entities';
import React from 'react';
import { PlayerList } from 'widgets';

type IProps = FlexProps & {
  players: User[];
};

const YachtDiceBody: React.FC<IProps> = ({
  players,
  ...props
}) => {
  return (
    <Flex width='100%' gap='8' {...props}>
      <Box height='100%' flex='3' />
      <Flex direction='column' flex='1'>
        <PlayerList players={players} />
      </Flex>
    </Flex>
  )
};

export default YachtDiceBody;