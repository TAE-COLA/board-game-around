import { Flex, FlexProps } from '@chakra-ui/react';
import { User } from 'models';
import React from 'react';
import { PlayerCard } from 'widgets';

type IProps = FlexProps & {
  players: User[];
  owner?: User;
  turn?: User;
};

export const PlayerList: React.FC<IProps> = ({ players, owner, turn, ...props }) => {
  return (
    <Flex direction='column' gap={{ base: 3, md: 4 }} minWidth={0} {...props}>
      {players.map((player) => (
        <PlayerCard
          key={player.id}
          player={player}
          isOwner={owner && owner.id === player.id}
          isPlayerTurn={turn && turn.id === player.id}
        />
      ))}
    </Flex>
  );
};
