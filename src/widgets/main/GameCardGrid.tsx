import classNames from 'classnames';
import { Game } from 'entities';
import React from 'react';
import { GameCard } from 'widgets';

export interface GameCardGridProps {
  games: Game[];
  className?: string;
}

const GameCardGrid: React.FC<GameCardGridProps> = ({ games, className }) => {
  "grid grid-cols-[repeat(auto-fit,384px)] gap-x-[${gap.x}] gap-y-[${gap.y}] py-8"
  return (
    <div className={
      classNames(
        'grid grid-cols-[repeat(auto-fit,384px)] py-8',
        className
      )
    }>
      { games.map(game => <GameCard key={game.id} game={game} />) }
    </div>
  )
}

export default GameCardGrid;