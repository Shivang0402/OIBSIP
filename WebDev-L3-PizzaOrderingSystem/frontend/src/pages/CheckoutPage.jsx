import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Loader2, MapPin, Pizza, ShoppingCart } from 'lucide-react';
import AppHeader from '../components/AppHeader';
import BackButton from '../components/BackButton';
import BottomNav from '../components/BottomNav';
import Footer from '../components/Footer';
import { getCart, clearCart } from '../services/cartService';
import { placeOrder } from '../services/orderService';
import { isRequired } from '../utils/validators';
import '../styles/checkout.css';

function formatPrice(price) {
  return `₹${Number(price).toFixed(2)}`;
}

function CheckoutPage() {
  const navigate = useNavigate();

  const items = getCart();
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const [address, setAddress] = useState({
    street: '',
    area: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [placing, setPlacing] = useState(false);
  const [placedOrders, setPlacedOrders] = useState(null);

  function handleChange(event) {
    const { name, value } = event.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setFormError('');
  }

  function validate() {
    const nextErrors = {};
    if (!isRequired(address.area)) nextErrors.area = 'Area / locality is required.';
    if (!isRequired(address.city)) nextErrors.city = 'City is required.';
    if (!isRequired(address.state)) nextErrors.state = 'State is required.';
    if (!isRequired(address.pincode)) nextErrors.pincode = 'Pincode is required.';
    else if (!/^\d{6}$/.test(address.pincode.trim()))
      nextErrors.pincode = 'Enter a valid 6-digit pincode.';
    return nextErrors;
  }

  async function handlePlaceOrder(event) {
    event.preventDefault();

    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setPlacing(true);
    setFormError('');

    const deliveryAddress = {
      street: address.street.trim(),
      area: address.area.trim(),
      city: address.city.trim(),
      state: address.state.trim(),
      pincode: Number(address.pincode.trim()),
    };

    try {
      const orderItems = items.map((item) => {
        const base = {
          quantity: item.quantity,
          base: item.customization.base,
          sauce: item.customization.sauce,
          cheese: item.customization.cheese,
          vegetables: item.customization.vegetables,
        };
        return item.pizzaId ? { ...base, pizzaId: item.pizzaId } : { ...base, unitPrice: item.price };
      });

      const data = await placeOrder({ items: orderItems, deliveryAddress });

      clearCart();
      setPlacedOrders({
        orderId: data.order?._id,
        orderNumber: data.order?.orderNumber,
        razorpayOrderId: data.razorpayOrderId,
        amount: data.amount || data.order?.totalPrice * 100,
        currency: data.currency || 'INR',
      });
    } catch (error) {
      setFormError(error.message || 'Unable to place your order. Please try again.');
      setPlacedOrders(null);
    } finally {
      setPlacing(false);
    }
  }

  if (items.length === 0 && !placedOrders) {
    return (
      <div className="checkout-page">
        <AppHeader />
        <main className="checkout-main">
          <BackButton />
          <div className="checkout-state">
            <div className="checkout-state__icon" aria-hidden="true">
              <ShoppingCart size={32} />
            </div>
            <h1 className="checkout-state__title">Your cart is empty</h1>
            <p className="checkout-state__text">Add some pizzas before checking out.</p>
            <button
              className="btn btn--primary btn--small"
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

  if (placedOrders) {
    return (
      <div className="checkout-page">
        <AppHeader />
        <main className="checkout-main">
          <BackButton />

          <section className="checkout-success">
            <div className="checkout-success__icon" aria-hidden="true">
              <CheckCircle2 size={44} />
            </div>
            <h1 className="checkout-success__title">Order placed!</h1>
            <p className="checkout-success__text">
              Your order has been received. Payment is pending — the payment step comes next.
            </p>

            <div className="checkout-success__orders">
              <div className="checkout-success__row">
                <span className="checkout-success__label">
                  Order #{placedOrders.orderNumber}
                </span>
                <span className="checkout-success__value">
                  {formatPrice(Number(placedOrders.amount) / 100)}
                </span>
                <span className="checkout-success__pending">Pending</span>
              </div>
              <div className="checkout-success__total">
                <span>Total payable</span>
                <strong>{formatPrice(Number(placedOrders.amount) / 100)}</strong>
              </div>
            </div>

            <p className="checkout-success__note">
              Razorpay payment UI will be added here next.
            </p>

            <div className="checkout-success__actions">
              <button
                className="btn btn--primary"
                type="button"
                onClick={() => navigate('/orders')}
              >
                View Orders
                <ArrowRight size={18} />
              </button>
              <button
                className="btn btn--secondary"
                type="button"
                onClick={() => navigate('/')}
              >
                Back to Home
              </button>
            </div>
          </section>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <AppHeader />

      <main className="checkout-main">
        <BackButton />

        <section className="checkout-head">
          <h1 className="checkout-head__title">Checkout</h1>
          <p className="checkout-head__subtitle">
            Enter your delivery address to place the order.
          </p>
        </section>

        <form className="checkout-grid" onSubmit={handlePlaceOrder} noValidate>
          <section className="checkout-address">
            <h2 className="checkout-address__title">
              <MapPin size={18} />
              Delivery Address
            </h2>

            <div className="checkout-field">
              <label className="checkout-field__label" htmlFor="checkout-street">
                Street / Flat / Building <span className="checkout-field__opt">(optional)</span>
              </label>
              <input
                className="checkout-field__input"
                id="checkout-street"
                type="text"
                name="street"
                placeholder="House no., street, landmark"
                value={address.street}
                onChange={handleChange}
              />
            </div>

            <div className="checkout-field">
              <label className="checkout-field__label" htmlFor="checkout-area">
                Area / Locality
              </label>
              <input
                className={`checkout-field__input${
                  errors.area ? ' checkout-field__input--invalid' : ''
                }`}
                id="checkout-area"
                type="text"
                name="area"
                placeholder="e.g. HSR Layout, Sector 1"
                value={address.area}
                onChange={handleChange}
              />
              {errors.area && <p className="checkout-field__error">{errors.area}</p>}
            </div>

            <div className="checkout-field">
              <label className="checkout-field__label" htmlFor="checkout-city">
                City
              </label>
              <input
                className={`checkout-field__input${
                  errors.city ? ' checkout-field__input--invalid' : ''
                }`}
                id="checkout-city"
                type="text"
                name="city"
                placeholder="e.g. Bengaluru"
                value={address.city}
                onChange={handleChange}
              />
              {errors.city && <p className="checkout-field__error">{errors.city}</p>}
            </div>

            <div className="checkout-field">
              <label className="checkout-field__label" htmlFor="checkout-state">
                State
              </label>
              <input
                className={`checkout-field__input${
                  errors.state ? ' checkout-field__input--invalid' : ''
                }`}
                id="checkout-state"
                type="text"
                name="state"
                placeholder="e.g. Karnataka"
                value={address.state}
                onChange={handleChange}
              />
              {errors.state && <p className="checkout-field__error">{errors.state}</p>}
            </div>

            <div className="checkout-field">
              <label className="checkout-field__label" htmlFor="checkout-pincode">
                Pincode
              </label>
              <input
                className={`checkout-field__input${
                  errors.pincode ? ' checkout-field__input--invalid' : ''
                }`}
                id="checkout-pincode"
                type="text"
                name="pincode"
                placeholder="6-digit pincode"
                maxLength={6}
                inputMode="numeric"
                value={address.pincode}
                onChange={handleChange}
              />
              {errors.pincode && <p className="checkout-field__error">{errors.pincode}</p>}
            </div>
          </section>

          <aside className="checkout-summary">
            <h2 className="checkout-summary__title">Order Summary</h2>

            <div className="checkout-summary__items">
              {items.map((item) => (
                <div key={item.id} className="checkout-item">
                  <div className="checkout-item__thumb" aria-hidden="true">
                    {item.image ? (
                      <img className="checkout-item__img" src={item.image} alt={item.name} />
                    ) : (
                      <Pizza size={22} />
                    )}
                  </div>
                  <div className="checkout-item__info">
                    <p className="checkout-item__name">
                      {item.name} <span className="checkout-item__qty">× {item.quantity}</span>
                    </p>
                    <p className="checkout-item__custom">
                      {item.customization.base} · {item.customization.sauce} ·{' '}
                      {item.customization.cheese}
                      {item.customization.vegetables.length > 0 && (
                        <> · +{item.customization.vegetables.length} veg</>
                      )}
                    </p>
                  </div>
                  <strong className="checkout-item__price">
                    {formatPrice(item.price * item.quantity)}
                  </strong>
                </div>
              ))}
            </div>

            <div className="checkout-summary__divider" />
            <div className="checkout-summary__row">
              <span>Subtotal</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div className="checkout-summary__row">
              <span>Delivery</span>
              <span>—</span>
            </div>
            <div className="checkout-summary__divider" />
            <div className="checkout-summary__row checkout-summary__row--total">
              <span>Total</span>
              <strong>{formatPrice(total)}</strong>
            </div>

            {formError && <p className="checkout-summary__error">{formError}</p>}

            <button
              className="checkout-summary__submit"
              type="submit"
              disabled={placing || items.length === 0}
            >
              {placing ? (
                <>
                  <Loader2 className="checkout-summary__spinner" size={18} />
                  Placing order&hellip;
                </>
              ) : (
                <>
                  Place Order
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </aside>
        </form>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}

export default CheckoutPage;
