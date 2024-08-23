import { BoxProps, SimpleGrid } from '@chakra-ui/react';
import { Game } from 'entities';
import React from 'react';
import { GameCard } from 'widgets';

type IProps = BoxProps & {
  games: Game[];
}

const GameCardGrid: React.FC<IProps> = ({ 
  games,
  ...props
}) => {
  return (
    <SimpleGrid minChildWidth="120px" spacing='40px' {...props}>
      {games.map(game => <GameCard key={game.id} game={game} onClickButton={() => {}}/>)}
    </SimpleGrid>
  )
}

export default GameCardGrid;