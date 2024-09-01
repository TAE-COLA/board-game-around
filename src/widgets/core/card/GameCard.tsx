import { Button, ButtonProps, Card, CardBody, CardFooter, CardHeader, CardProps, Heading, HeadingProps, Text } from '@chakra-ui/react';
import { Game } from 'entities';
import React from 'react';

type IProps = CardProps & {
  game: Game;
  onClickGamePlayButton: ButtonProps['onClick'];
  headerSize?: HeadingProps['size'];
}

const GameCard: React.FC<IProps> = ({ 
  game,
  onClickGamePlayButton,
  headerSize = 'md',
  ...props
}) => {
  return (
    <Card {...props}>
      <CardHeader>
        <Heading size={headerSize}>{game.name}</Heading>
      </CardHeader>
      <CardBody>
        <Text>{game.description}</Text>
      </CardBody>
      <CardFooter>
        <Button onClick={onClickGamePlayButton}>플레이 하기</Button>
      </CardFooter>
    </Card>
  )
}

export default GameCard;