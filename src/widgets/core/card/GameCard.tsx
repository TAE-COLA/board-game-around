import { Button, Card, CardBody, CardFooter, CardHeader, Heading, Text } from '@chakra-ui/react';
import { Game } from 'entities';
import React from 'react';
import { HeadingSize } from 'shared';

type IProps = {
  game: Game;
  onClickButton: () => void;
  className?: string;
  headerSize?: HeadingSize;
}

const GameCard: React.FC<IProps> = ({ 
  game,
  onClickButton,
  className = '',
  headerSize = HeadingSize.MD
}) => {
  return (
    <Card className={className}>
      <CardHeader>
        <Heading size={headerSize}>{ game.name }</Heading>
      </CardHeader>
      <CardBody>
        <Text>{ game.description }</Text>
      </CardBody>
      <CardFooter>
        <Button onClick={onClickButton}>플레이 하기</Button>
      </CardFooter>
    </Card>
  )
}

export default GameCard;