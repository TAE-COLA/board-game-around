import { GameCard } from 'widgets';

const GameCardGrid = ({ games, itemWidth, gap }) => {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,24rem)] gap-4 py-8">
      { games.map(game => <GameCard game={game} />) }
    </div>
  )
}

export default GameCardGrid;