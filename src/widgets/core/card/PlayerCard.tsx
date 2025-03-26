import { StarIcon } from '@chakra-ui/icons';
import { Card, CardBody, CardProps, Text } from '@chakra-ui/react';
import { User } from 'models';
import React from 'react';
import { Align, Direction, Size } from 'shared';

type Props = CardProps & {
  player: User;
  isOwner?: boolean;
  isPlayerTurn?: boolean;
};

export const PlayerCard: React.FC<Props> = ({
  player,
  isOwner = false,
  isPlayerTurn = true,
  ...props
}) => {
  return (
    <Card
      direction={{ base: Direction.Column, sm: Direction.Row }}
      align={Align.Center}
      size={isPlayerTurn ? Size.Md : Size.Sm}
      opacity={isPlayerTurn ? 1 : 0.5}
      marginStart={isPlayerTurn ? 0 : 4}
      {...props}
    >
      <CardBody>
        <Text>{player.name}</Text>
      </CardBody>
      {isOwner && <StarIcon width={6} height={6} marginEnd={4} />}
    </Card>
  );
};
