import { BoxProps, SimpleGrid } from '@chakra-ui/react';
import { Game, GameCard } from 'features/game';
import React from 'react';

type IProps = BoxProps & {
  gameList: Game[];
  onClickGamePlayButton: (game: Game) => void;
};

export const GameCardGrid: React.FC<IProps> = ({ gameList, onClickGamePlayButton, ...props }) => {
  return (
    <SimpleGrid minChildWidth={{ base: '100%', sm: '220px', md: '240px' }} spacing={{ base: 4, md: 10 }} {...props}>
      {gameList.map((game) => (
        <GameCard key={game.id} game={game} onClickGamePlayButton={() => onClickGamePlayButton(game)} />
      ))}
    </SimpleGrid>
  );
};
