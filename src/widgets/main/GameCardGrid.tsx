import { Game } from 'entities';
import React from 'react';
import { defaultFD, defaultTD, type FourDirections, type TwoDirections } from 'shared';
import { GameCard, StyledGrid } from 'widgets';

type IProps = {
  games: Game[];
  columns: number | string;
  className?: string;
  gap?: TwoDirections;
  padding?: FourDirections;
  margin?: FourDirections;
}

const GameCardGrid: React.FC<IProps> = ({ 
  games, 
  columns,
  className = '',
  gap = defaultTD,
  padding = defaultFD,
  margin = defaultFD
}) => {
  return (
    <StyledGrid className={className} columns={columns} gap={gap} padding={padding} margin={margin}>
      {games.map(game => <GameCard key={game.id} game={game} />)}
    </StyledGrid>
  )
}

export default GameCardGrid;