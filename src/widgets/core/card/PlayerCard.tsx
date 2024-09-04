import { StarIcon } from '@chakra-ui/icons';
import { Card, CardBody, CardProps, Text } from '@chakra-ui/react';
import { User } from 'entities';
import React from 'react';

type IProps = CardProps & {
  player: User;
  isOwner?: boolean;
  isPlayerTurn?: boolean;
};

const PlayerCard: React.FC<IProps> = ({
  player,
  isOwner = false,
  ...props
}) => {
  return (
    <Card direction={{ base: 'column', sm: 'row' }} align='center' {...props}>
      <CardBody>
        <Text>{player.name}</Text>
      </CardBody>
      {isOwner && <StarIcon width='6' height='6' marginEnd='4' />}
    </Card>
  )
}

export default PlayerCard;