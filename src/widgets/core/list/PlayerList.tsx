import { Flex, FlexProps } from '@chakra-ui/react';
import { User } from 'models';
import React from 'react';
import { Direction } from 'shared';
import { PlayerCard } from 'widgets';

type Props = FlexProps & {
  players: User[];
  owner?: User;
  turn?: User;
};

export const PlayerList: React.FC<Props> = ({ players, owner, turn, ...props }) => {
  return (
    <Flex direction={Direction.Column} gap={4} {...props}>
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
