import { BoxProps, SimpleGrid } from '@chakra-ui/react';
import { Game } from 'models';
import React from 'react';
import { GameCard } from 'widgets';

type IProps = BoxProps & {
  gameList: Game[];
  onClickGamePlayButton: (game: Game) => void;
};

export const GameCardGrid: React.FC<IProps> = ({ gameList, onClickGamePlayButton, ...props }) => {
  return (
    <SimpleGrid minChildWidth='240px' spacing='40px' {...props}>
      {gameList.map((game) => (
        <GameCard key={game.id} game={game} onClickGamePlayButton={() => onClickGamePlayButton(game)} />
      ))}
    </SimpleGrid>
  );
};
