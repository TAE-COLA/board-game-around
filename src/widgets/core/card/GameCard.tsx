import { Button, Card, CardBody, CardFooter, CardHeader, CardProps, Heading, HeadingProps, Text } from '@chakra-ui/react';
import { Game } from 'entities';
import React from 'react';

type IProps = CardProps & {
  game: Game;
  onClickButton: () => void;
  headerSize?: HeadingProps['size'];
}

const GameCard: React.FC<IProps> = ({ 
  game,
  onClickButton,
  headerSize = 'md',
  ...props
}) => {
  return (
    <Card {...props}>
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