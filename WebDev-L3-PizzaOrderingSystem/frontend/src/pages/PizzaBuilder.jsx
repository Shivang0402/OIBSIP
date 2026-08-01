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
    options: [
      { name: 'Thin Crust', price: 0 },
      { name: 'Thick Crust', price: 20 },
      { name: 'Cheese Burst', price: 60 },
      { name: 'Stuffed Crust', price: 60 },
      { name: 'Whole Wheat', price: 30 },
    ],
  },
  {
    key: 'sauce',
    title: 'Pick a Sauce',
    single: true,
    options: [
      { name: 'Classic Tomato', price: 0 },
      { name: 'Spicy Tomato', price: 0 },
      { name: 'BBQ', price: 20 },
      { name: 'Pesto', price: 30 },
      { name: 'White Garlic', price: 20 },
    ],
  },
  {
    key: 'cheese',
    title: 'Select Cheese',
    single: true,
    options: [
      { name: 'Mozzarella', price: 0 },
      { name: 'Cheddar', price: 30 },
      { name: 'Parmesan', price: 40 },
      { name: 'Processed Cheese', price: 20 },
      { name: 'Vegan Cheese', price: 50 },
    ],
  },
  {
    key: 'vegetables',
    title: 'Add Vegetables',
    single: false,
    options: [
      { name: 'Onion', price: 15 },
      { name: 'Tomato', price: 15 },
      { name: 'Capsicum', price: 15 },
      { name: 'Jalapeño', price: 15 },
      { name: 'Sweet Corn', price: 20 },
      { name: 'Mushroom', price: 25 },
      { name: 'Black Olive', price: 25 },
      { name: 'Green Olive', price: 25 },
      { name: 'Paneer', price: 40 },
      { name: 'Broccoli', price: 15 },
    ],
  },
];

function optionPrice(stepKey, name) {
  const step = BUILDER_STEPS.find((s) => s.key === stepKey);
  return step?.options.find((o) => o.name === name)?.price ?? 0;
}

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
  const addonsPrice =
    (base ? optionPrice('base', base) : 0) +
    (sauce ? optionPrice('sauce', sauce) : 0) +
    (cheese ? optionPrice('cheese', cheese) : 0) +
    vegetables.reduce((sum, veg) => sum + optionPrice('vegetables', veg), 0);
  const unitPrice = BASE_PRICE + addonsPrice;
  const total = unitPrice * quantity;

  function selectOption(stepKey, option) {
    setAdded(false);
    if (stepKey === 'base') setBase((current) => (current === option ? null : option));
    else if (stepKey === 'sauce') setSauce((current) => (current === option ? null : option));
    else if (stepKey === 'cheese') setCheese((current) => (current === option ? null : option));
    else {
      setVegetables((current) =>
        current.includes(option) ? current.filter((v) => v !== option) : [...current, option],
      );
    }
  }

  function handleAddToCart() {
    if (!canAdd) return;
    addCartItem({
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name: 'Custom Pizza',
      price: unitPrice,
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
                    const selected = (selections[step.key] || []).includes(option.name);
                    return (
                      <button
                        key={option.name}
                        type="button"
                        className={`builder-option${selected ? ' builder-option--selected' : ''}`}
                        onClick={() => selectOption(step.key, option.name)}
                      >
                        <span className="builder-option__check">
                          <Check size={14} />
                        </span>
                        {option.name}
                        {option.price > 0 && (
                          <span className="builder-option__price">+{formatPrice(option.price)}</span>
                        )}
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
              <SummaryRow
                label="Base"
                value={base ? `${base} (+${formatPrice(optionPrice('base', base))})` : 'Not selected'}
                missing={!base}
              />
              <SummaryRow
                label="Sauce"
                value={sauce ? `${sauce} (+${formatPrice(optionPrice('sauce', sauce))})` : 'Not selected'}
                missing={!sauce}
              />
              <SummaryRow
                label="Cheese"
                value={cheese ? `${cheese} (+${formatPrice(optionPrice('cheese', cheese))})` : 'Not selected'}
                missing={!cheese}
              />
              <SummaryRow
                label="Vegetables"
                value={
                  vegetables.length
                    ? vegetables
                        .map((veg) => `${veg} (+${formatPrice(optionPrice('vegetables', veg))})`)
                        .join(', ')
                    : 'None'
                }
              />
            </div>

            <div className="builder-summary__divider" />

            <div className="builder-summary__price-row">
              <span className="builder-summary__label">Price per pizza</span>
              <span className="builder-summary__price">{formatPrice(unitPrice)}</span>
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
              <strong>{formatPrice(total)}</strong>
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
