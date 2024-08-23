import { Button, Card, CardBody, CardFooter, CardHeader, Heading, Text } from '@chakra-ui/react';
import { Game } from 'entities';
import React from 'react';

type IProps = {
  game: Game;
  className?: string;
}

const GameCard: React.FC<IProps> = ({ 
  game 
}) => {
  return (
    <Card>
      <CardHeader>
        <Heading size='md'>{ game.name }</Heading>
      </CardHeader>
      <CardBody>
        <Text>{ game.description }</Text>
      </CardBody>
      <CardFooter>
        <Button>View here</Button>
      </CardFooter>
    </Card>
  )
}

export default GameCard;