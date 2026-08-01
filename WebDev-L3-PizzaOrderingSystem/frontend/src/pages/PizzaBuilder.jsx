import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronLeft, Minus, Pizza, Plus, ShoppingCart } from 'lucide-react';
import AppHeader from '../components/AppHeader';
import { addCartItem } from '../services/cartService';
import '../styles/builder.css';

const BASE_PRICE = 199;

const BUILDER_STEPS = [
  {
    key: 'base',
    title: 'Choose Your Base',
    single: true,
    options: ['Thin Crust', 'Thick Crust', 'Cheese Burst', 'Stuffed Crust', 'Whole Wheat'],
  },
  {
    key: 'sauce',
    title: 'Pick a Sauce',
    single: true,
    options: ['Classic Tomato', 'Spicy Tomato', 'BBQ', 'Pesto', 'White Garlic'],
  },
  {
    key: 'cheese',
    title: 'Select Cheese',
    single: true,
    options: ['Mozzarella', 'Cheddar', 'Parmesan', 'Processed Cheese', 'Vegan Cheese'],
  },
  {
    key: 'vegetables',
    title: 'Add Vegetables',
    single: false,
    options: [
      'Onion',
      'Tomato',
      'Capsicum',
      'Jalapeño',
      'Mushroom',
      'Sweet Corn',
      'Black Olive',
      'Green Olive',
      'Paneer',
      'Broccoli',
    ],
  },
];

function formatPrice(price) {
  return `₹${Number(price).toFixed(2)}`;
}

function PizzaBuilder() {
  const navigate = useNavigate();

  const [base, setBase] = useState(null);
  const [sauce, setSauce] = useState(null);
  const [cheese, setCheese] = useState(null);
  const [vegetables, setVegetables] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const selections = { base, sauce, cheese, vegetables };
  const canAdd = Boolean(base && sauce && cheese);

  function selectOption(stepKey, option) {
    setAdded(false);
    if (stepKey === 'base') setBase(option);
    else if (stepKey === 'sauce') setSauce(option);
    else if (stepKey === 'cheese') setCheese(option);
    else {
      setVegetables((current) =>
        current.includes(option) ? current.filter((v) => v !== option) : [...current, option],
      );
    }
  }

  function handleAddToCart() {
    if (!canAdd) return;
    addCartItem({
      id: crypto.randomUUID(),
      name: 'Custom Pizza',
      price: BASE_PRICE,
      quantity,
      image: '',
      customization: { base, sauce, cheese, vegetables },
    });
    setAdded(true);
  }

  return (
    <div className="builder-page">
      <AppHeader />

      <main className="builder-main">
        <button className="builder-back" type="button" onClick={() => navigate('/')}>
          <ChevronLeft size={16} />
          Back to Home
        </button>

        <div className="builder-head">
          <h1 className="builder-head__title">Build Your Own Pizza</h1>
          <p className="builder-head__subtitle">
            Choose your base, sauce, cheese and toppings — we&apos;ll handle the rest.
          </p>
        </div>

        <div className="builder-grid">
          <div className="builder-steps">
            {BUILDER_STEPS.map((step, index) => (
              <section key={step.key} className="builder-step">
                <div className="builder-step__head">
                  <span className="builder-step__number">{index + 1}</span>
                  <h2 className="builder-step__title">{step.title}</h2>
                  {!step.single && vegetables.length > 0 && (
                    <span className="builder-step__count">
                      {vegetables.length} selected
                    </span>
                  )}
                </div>
                <div className="builder-options">
                  {step.options.map((option) => {
                    const selected = selections[step.key].includes(option);
                    return (
                      <button
                        key={option}
                        type="button"
                        className={`builder-option${selected ? ' builder-option--selected' : ''}`}
                        onClick={() => selectOption(step.key, option)}
                      >
                        <span className="builder-option__check">
                          <Check size={14} />
                        </span>
                        {option}
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>

          <aside className="builder-summary">
            <div className="builder-summary__art" aria-hidden="true">
              <Pizza size={44} />
            </div>
            <h2 className="builder-summary__title">Your Pizza</h2>

            <div className="builder-summary__rows">
              <SummaryRow label="Base" value={base || 'Not selected'} missing={!base} />
              <SummaryRow label="Sauce" value={sauce || 'Not selected'} missing={!sauce} />
              <SummaryRow label="Cheese" value={cheese || 'Not selected'} missing={!cheese} />
              <SummaryRow
                label="Vegetables"
                value={vegetables.length ? vegetables.join(', ') : 'None'}
              />
            </div>

            <div className="builder-summary__divider" />

            <div className="builder-summary__price-row">
              <span className="builder-summary__label">Price</span>
              <span className="builder-summary__price">{formatPrice(BASE_PRICE)}</span>
            </div>
            <div className="builder-summary__price-row">
              <span className="builder-summary__label">Quantity</span>
              <div className="builder-qty">
                <button
                  type="button"
                  className="builder-qty__btn"
                  aria-label="Decrease quantity"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  <Minus size={16} />
                </button>
                <span className="builder-qty__value">{quantity}</span>
                <button
                  type="button"
                  className="builder-qty__btn"
                  aria-label="Increase quantity"
                  onClick={() => setQuantity((q) => q + 1)}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className="builder-summary__divider" />

            <div className="builder-summary__total-row">
              <span>Total</span>
              <strong>{formatPrice(BASE_PRICE * quantity)}</strong>
            </div>

            {added && (
              <p className="builder-summary__success">Added to your cart!</p>
            )}

            <button
              className="builder-summary__add"
              type="button"
              disabled={!canAdd}
              onClick={handleAddToCart}
            >
              <ShoppingCart size={18} />
              Add to Cart
            </button>
            {!canAdd && (
              <p className="builder-summary__hint">Select a base, sauce and cheese to add to cart.</p>
            )}
            {added && (
              <button
                className="builder-summary__view-cart"
                type="button"
                onClick={() => navigate('/cart')}
              >
                View Cart
              </button>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}

function SummaryRow({ label, value, missing = false }) {
  return (
    <div className="builder-summary__row">
      <span className="builder-summary__label">{label}</span>
      <span className={`builder-summary__value${missing ? ' builder-summary__value--missing' : ''}`}>
        {value}
      </span>
    </div>
  );
}

export default PizzaBuilder;
