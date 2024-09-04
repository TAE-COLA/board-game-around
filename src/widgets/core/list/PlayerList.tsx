import { Flex, FlexProps } from '@chakra-ui/react';
import { User } from 'entities';
import React from 'react';
import { PlayerCard } from 'widgets';

type IProps = FlexProps & {
  players: User[];
  owner?: User;
};

const PlayerList: React.FC<IProps> = ({
  players,
  owner,
  ...props
}) => {
  return (
    <Flex direction='column' gap='4' {...props}>
      {players.map((player) => (
        <PlayerCard key={player.id} 
          player={player} 
          isOwner={owner && owner.id === player.id} 
        />
      ))}
    </Flex>
  )
}

export default PlayerList;