import { Game } from 'entities';
import React from 'react';

export interface GameCardProps {
  game: Game;
}

const GameCard: React.FC<GameCardProps> = ({ game }) => {
  return (
    <div className="card w-96 bg-white shadow-xl">
      <figure>
        <img src={game.image} alt={game.name} />
      </figure>
      <div className="card-body">
        <h2 className="card-title">{ game.name }</h2>
        <p>{ game.description }</p>
        <div className="card-actions justify-end">
          <button className="btn btn-primary">Buy Now</button>
        </div>
      </div>
    </div>
  )
}

export default GameCard;