import { Link } from 'react-router-dom';
import { ArrowRight, Pizza } from 'lucide-react';

function formatPrice(price) {
  return `₹${Number(price).toFixed(2)}`;
}

function PizzaCard({ pizza }) {
  return (
    <Link className="home-pizza" to={`/pizza/${pizza._id}`}>
      <div className="home-pizza__image-wrap">
        {pizza.image ? (
          <img className="home-pizza__image" src={pizza.image} alt={pizza.name} />
        ) : (
          <div className="home-pizza__image-placeholder" aria-hidden="true">
            <Pizza size={48} />
          </div>
        )}
        {!pizza.isAvailable && <span className="home-pizza__unavailable">Unavailable</span>}
      </div>
      <div className="home-pizza__body">
        <h3 className="home-pizza__name">{pizza.name}</h3>
        <p className="home-pizza__desc">{pizza.description}</p>
        <div className="home-pizza__row">
          <span className="home-pizza__price">{formatPrice(pizza.price)}</span>
          <span className="home-pizza__view">
            View
            <ArrowRight size={16} />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default PizzaCard;
