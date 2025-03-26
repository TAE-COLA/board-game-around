import { BoxProps, SimpleGrid } from '@chakra-ui/react';
import { Game } from 'models';
import React from 'react';
import { GameCard } from './GameCard';

type Props = BoxProps & {
  gameList: Game[];
  onClickGamePlayButton: (game: Game) => void;
};

export const GameCardGrid: React.FC<Props> = ({ gameList, onClickGamePlayButton, ...props }) => {
  return (
    <SimpleGrid minChildWidth={60} spacing={10} {...props}>
      {gameList.map((game) => (
        <GameCard
          key={game.id}
          game={game}
          onClickGamePlayButton={() => onClickGamePlayButton(game)}
        />
      ))}
    </SimpleGrid>
  );
};
