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
  isPlayerTurn = true,
  ...props
}) => {
  return (
    <Card 
      direction={{ base: 'column', sm: 'row' }} 
      align='center' 
      size={isPlayerTurn ? 'md' : 'sm'} 
      opacity={isPlayerTurn ? '1' : '0.5'} 
      marginStart={isPlayerTurn ? '0' : '4'}
      {...props}
    >
      <CardBody>
        <Text>{player.name}</Text>
      </CardBody>
      {isOwner && <StarIcon width='6' height='6' marginEnd='4' />}
    </Card>
  )
}

export default PlayerCard;