const GameCard = ({ game }) => {

  return (
    <div className="card w-96 bg-white shadow-xl">
      <figure>
        <img
          src={ game.image }
          alt="Game" />
      </figure>
      <div class="card-body">
        <h2 class="card-title">{ game.name }</h2>
        <p>{ game.description }</p>
        <div class="card-actions justify-end">
          <button class="btn btn-primary">Buy Now</button>
        </div>
      </div>
    </div>
  )
}

export default GameCard;