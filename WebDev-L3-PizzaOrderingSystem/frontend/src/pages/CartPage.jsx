import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Minus, Pizza, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import AppHeader from '../components/AppHeader';
import { getCart, updateCartQuantity, removeCartItem } from '../services/cartService';
import '../styles/cart.css';

function formatPrice(price) {
  return `₹${Number(price).toFixed(2)}`;
}

function CartPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState(getCart());

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  function changeQuantity(id, quantity) {
    updateCartQuantity(id, quantity);
    setItems(getCart());
  }

  function removeItem(id) {
    removeCartItem(id);
    setItems(getCart());
  }

  if (items.length === 0) {
    return (
      <div className="cart-page">
        <AppHeader />
        <main className="cart-main">
          <div className="cart-empty">
            <div className="cart-empty__icon" aria-hidden="true">
              <ShoppingCart size={28} />
            </div>
            <h1 className="cart-empty__title">Your cart is empty</h1>
            <p className="cart-empty__text">
              Looks like you haven&apos;t added anything yet. Browse the menu or build your own
              pizza.
            </p>
            <div className="cart-empty__actions">
              <button className="btn btn--primary" type="button" onClick={() => navigate('/menu')}>
                Browse Menu
              </button>
              <button
                className="btn btn--secondary"
                type="button"
                onClick={() => navigate('/pizza-builder')}
              >
                Build a Pizza
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <AppHeader />

      <main className="cart-main">
        <div className="cart-head">
          <h1 className="cart-head__title">Your Cart</h1>
          <p className="cart-head__subtitle">{items.length} item{items.length > 1 ? 's' : ''}</p>
        </div>

        <div className="cart-grid">
          <div className="cart-items">
            {items.map((item) => (
              <article key={item.id} className="cart-item">
                <div className="cart-item__thumb" aria-hidden="true">
                  <Pizza size={28} />
                </div>
                <div className="cart-item__body">
                  <h2 className="cart-item__name">{item.name}</h2>
                  <p className="cart-item__custom">
                    {item.customization.base} · {item.customization.sauce} ·{' '}
                    {item.customization.cheese}
                    {item.customization.vegetables.length > 0 && (
                      <>
                        {' '}
                        · +{item.customization.vegetables.length} veg
                      </>
                    )}
                  </p>
                  <div className="cart-item__row">
                    <div className="cart-qty">
                      <button
                        type="button"
                        className="cart-qty__btn"
                        aria-label="Decrease quantity"
                        disabled={item.quantity <= 1}
                        onClick={() => changeQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="cart-qty__value">{item.quantity}</span>
                      <button
                        type="button"
                        className="cart-qty__btn"
                        aria-label="Increase quantity"
                        onClick={() => changeQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="cart-item__price">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                    <button
                      type="button"
                      className="cart-item__remove"
                      aria-label={`Remove ${item.name}`}
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <aside className="cart-summary">
            <h2 className="cart-summary__title">Order Summary</h2>
            <div className="cart-summary__row">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="cart-summary__row">
              <span>Delivery</span>
              <span>—</span>
            </div>
            <div className="cart-summary__divider" />
            <div className="cart-summary__row cart-summary__row--total">
              <span>Total</span>
              <strong>{formatPrice(subtotal)}</strong>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default CartPage;
