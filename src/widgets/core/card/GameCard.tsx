import {
  Button,
  ButtonProps,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardProps,
  Flex,
  Heading,
  HeadingProps,
  Text,
} from '@chakra-ui/react';
import { Game } from 'models';
import React from 'react';
import { GameMetadataTags } from '../game-metadata';

type IProps = CardProps & {
  game: Game;
  onClickGamePlayButton: ButtonProps['onClick'];
  headerSize?: HeadingProps['size'];
};

export const GameCard: React.FC<IProps> = ({ game, onClickGamePlayButton, headerSize = 'md', ...props }) => {
  return (
    <Card {...props}>
      <CardHeader padding={{ base: 4, md: 5 }}>
        <Flex direction='column' gap={3}>
          <Heading size={headerSize}>{game.name}</Heading>
          <GameMetadataTags metadata={game.metadata} />
        </Flex>
      </CardHeader>
      <CardBody paddingX={{ base: 4, md: 5 }} paddingY={{ base: 2, md: 3 }}>
        <Text>{game.description}</Text>
      </CardBody>
      <CardFooter padding={{ base: 4, md: 5 }}>
        <Button onClick={onClickGamePlayButton} width={{ base: '100%', sm: 'auto' }}>
          플레이 하기
        </Button>
      </CardFooter>
    </Card>
  );
};
