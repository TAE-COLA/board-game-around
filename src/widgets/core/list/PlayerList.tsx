import { Flex, FlexProps } from '@chakra-ui/react';
import { User } from 'entities';
import { useLoungeContext } from 'features';
import React from 'react';
import { PlayerCard } from 'widgets';

type IProps = FlexProps & {
  owner?: User;
  turn?: User;
};

const PlayerList: React.FC<IProps> = ({ 
  owner,
  turn,
  ...props 
}) => {
  const lounge = useLoungeContext();

  return (
    <Flex direction='column' gap='4' {...props}>
      {lounge.players.map((player) => (
        <PlayerCard key={player.id} 
          player={player} 
          isOwner={owner && owner.id === player.id} 
          isPlayerTurn={turn && turn.id === player.id}
        />
      ))}
    </Flex>
  )
}

export default PlayerList;