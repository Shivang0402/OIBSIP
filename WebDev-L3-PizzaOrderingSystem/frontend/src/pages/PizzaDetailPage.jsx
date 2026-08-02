import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Check, Minus, Pizza, Plus, ShoppingCart } from 'lucide-react';
import AppHeader from '../components/AppHeader';
import BackButton from '../components/BackButton';
import BottomNav from '../components/BottomNav';
import Footer from '../components/Footer';
import { getPizzaById } from '../services/pizzaService';
import { addCartItem, makeCartItemId } from '../services/cartService';
import { addonsPrice, PIZZA_OPTIONS } from '../utils/pizzaOptions';
import '../styles/pizza-detail.css';

function formatPrice(price) {
  return `₹${Number(price).toFixed(2)}`;
}

const DEFAULT_BASE = 'Thin Crust';
const DEFAULT_SAUCE = 'Classic Tomato';

const CUSTOMIZABLE_STEPS = PIZZA_OPTIONS.filter((step) => step.key !== 'base' && step.key !== 'sauce');

function PizzaDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pizza, setPizza] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [cheese, setCheese] = useState(null);
  const [vegetables, setVegetables] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await getPizzaById(id);
        if (!cancelled) setPizza(data.pizza);
      } catch (loadError) {
        if (!cancelled) setError(loadError.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  function selectOption(stepKey, option) {
    setAdded(false);
    if (stepKey === 'cheese') setCheese((current) => (current === option ? null : option));
    else {
      setVegetables((current) =>
        current.includes(option) ? current.filter((v) => v !== option) : [...current, option],
      );
    }
  }

  function handleAddToCart() {
    if (!pizza || !pizza.isAvailable) return;
    addCartItem({
      id: makeCartItemId(`pizza-${pizza._id}`),
      pizzaId: pizza._id,
      name: pizza.name,
      price: unitPrice,
      quantity,
      image: pizza.image || '',
      customization: { base: DEFAULT_BASE, sauce: DEFAULT_SAUCE, cheese, vegetables },
    });
    setAdded(true);
  }

  if (loading) {
    return (
      <div className="pizza-detail-page">
        <AppHeader />
        <main className="pizza-detail-main">
          <BackButton fallbackTo="/menu" label="Back to Menu" />
          <div className="pizza-detail-state">
            <div className="pizza-detail-state__spinner" aria-hidden="true" />
            <p>Heating the oven&hellip;</p>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  if (error || !pizza) {
    return (
      <div className="pizza-detail-page">
        <AppHeader />
        <main className="pizza-detail-main">
          <BackButton fallbackTo="/menu" label="Back to Menu" />
          <div className="pizza-detail-state">
            <div className="pizza-detail-state__icon" aria-hidden="true">
              <Pizza size={32} />
            </div>
            <p>{error || 'We could not find that pizza.'}</p>
            <button
              className="btn btn--secondary btn--small"
              type="button"
              onClick={() => navigate('/menu')}
            >
              Browse Menu
            </button>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  const selections = {
    base: DEFAULT_BASE,
    sauce: DEFAULT_SAUCE,
    cheese,
    vegetables,
  };
  const canAdd = Boolean(cheese);
  const unitPrice = pizza.price + addonsPrice(selections);
  const total = unitPrice * quantity;

  return (
    <div className="pizza-detail-page">
      <AppHeader />

      <main className="pizza-detail-main">
        <BackButton fallbackTo="/menu" label="Back to Menu" />

        <div className="pizza-detail-grid">
          <section className="pizza-detail-art">
            <div className="pizza-detail-art__image-wrap">
              {pizza.image ? (
                <img
                  className="pizza-detail-art__image"
                  src={pizza.image}
                  alt={pizza.name}
                />
              ) : (
                <div className="pizza-detail-art__placeholder" aria-hidden="true">
                  <Pizza size={88} />
                </div>
              )}
              {!pizza.isAvailable && (
                <span className="pizza-detail-art__unavailable">Unavailable</span>
              )}
            </div>
            <div className="pizza-detail-art__body">
              <h1 className="pizza-detail-art__name">{pizza.name}</h1>
              <p className="pizza-detail-art__desc">{pizza.description}</p>
              <div className="pizza-detail-art__row">
                <span className="pizza-detail-art__price">{formatPrice(pizza.price)}</span>
                <span className="pizza-detail-art__hint">before customizations</span>
              </div>
            </div>
          </section>

          <section className="pizza-detail-config">
            <h2 className="pizza-detail-config__title">Make It Extra</h2>
            <p className="pizza-detail-config__subtitle">
              Add a cheese upgrade or extra veggies to your {pizza.name}.
            </p>

            <div className="pizza-detail-steps">
              {CUSTOMIZABLE_STEPS.map((step, index) => (
                <section key={step.key} className="pizza-detail-step">
                  <div className="pizza-detail-step__head">
                    <span className="pizza-detail-step__number">{index + 1}</span>
                    <h3 className="pizza-detail-step__title">{step.title}</h3>
                    {!step.single && vegetables.length > 0 && (
                      <span className="pizza-detail-step__count">
                        {vegetables.length} selected
                      </span>
                    )}
                  </div>
                  <div className="pizza-detail-options">
                    {step.options.map((option) => {
                      const selected = (selections[step.key] || []).includes(option.name);
                      return (
                        <button
                          key={option.name}
                          type="button"
                          className={`pizza-detail-option${
                            selected ? ' pizza-detail-option--selected' : ''
                          }`}
                          onClick={() => selectOption(step.key, option.name)}
                        >
                          <span className="pizza-detail-option__check">
                            <Check size={14} />
                          </span>
                          <span className="pizza-detail-option__name">{option.name}</span>
                          {option.price > 0 && (
                            <span className="pizza-detail-option__price">
                              +{formatPrice(option.price)}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>

            <div className="pizza-detail-summary">
              <div className="pizza-detail-summary__row">
                <span className="pizza-detail-summary__label">Base price</span>
                <span className="pizza-detail-summary__value">
                  {formatPrice(pizza.price)}
                </span>
              </div>
              <div className="pizza-detail-summary__row">
                <span className="pizza-detail-summary__label">Add-ons</span>
                <span className="pizza-detail-summary__value">
                  {formatPrice(addonsPrice(selections))}
                </span>
              </div>
              <p className="pizza-detail-summary__defaults">
                Served on {DEFAULT_BASE.toLowerCase()} with {DEFAULT_SAUCE.toLowerCase()} sauce.
              </p>
              <div className="pizza-detail-summary__row">
                <span className="pizza-detail-summary__label">Quantity</span>
                <div className="pizza-detail-qty">
                  <button
                    type="button"
                    className="pizza-detail-qty__btn"
                    aria-label="Decrease quantity"
                    disabled={quantity <= 1}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  >
                    <Minus size={16} />
                  </button>
                  <span className="pizza-detail-qty__value">{quantity}</span>
                  <button
                    type="button"
                    className="pizza-detail-qty__btn"
                    aria-label="Increase quantity"
                    onClick={() => setQuantity((q) => q + 1)}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
              <div className="pizza-detail-summary__divider" />
              <div className="pizza-detail-summary__total">
                <span>Total</span>
                <strong>{formatPrice(total)}</strong>
              </div>

              {added && (
                <p className="pizza-detail-summary__success">Added to your cart!</p>
              )}

              <button
                className="pizza-detail-summary__add"
                type="button"
                disabled={!pizza.isAvailable || !canAdd}
                onClick={handleAddToCart}
              >
                <ShoppingCart size={18} />
                Add to Cart
              </button>
              {!pizza.isAvailable && (
                <p className="pizza-detail-summary__hint">
                  This pizza is currently unavailable.
                </p>
              )}
              {pizza.isAvailable && !canAdd && (
                <p className="pizza-detail-summary__hint">Select a cheese to add to cart.</p>
              )}
              {added && (
                <button
                  className="pizza-detail-summary__view-cart"
                  type="button"
                  onClick={() => navigate('/cart')}
                >
                  View Cart
                </button>
              )}
            </div>
          </section>
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}

export default PizzaDetailPage;
