import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  Pizza,
  ShoppingCart,
  XCircle,
} from 'lucide-react';
import AppHeader from '../components/AppHeader';
import BackButton from '../components/BackButton';
import BottomNav from '../components/BottomNav';
import Footer from '../components/Footer';
import { getCart, clearCart } from '../services/cartService';
import { placeOrder, markPaymentFailed } from '../services/orderService';
import { completeOrderPayment, PAYMENT_DISMISSED } from '../services/paymentService';
import { isRequired } from '../utils/validators';
import '../styles/checkout.css';

function formatPrice(price) {
  return `₹${Number(price).toFixed(2)}`;
}

function formatDateTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
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
  const [placedOrder, setPlacedOrder] = useState(null);
  const [paymentState, setPaymentState] = useState('idle');
  const [paymentError, setPaymentError] = useState('');

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
          unitPrice: item.price,
        };
        return item.pizzaId ? { ...base, pizzaId: item.pizzaId } : base;
      });

      const data = await placeOrder({ items: orderItems, deliveryAddress });
      const order = {
        orderId: data.order?._id,
        orderNumber: data.order?.orderNumber,
        razorpayOrderId: data.razorpayOrderId,
        amount: data.amount || data.order?.totalPrice * 100,
        currency: data.currency || 'INR',
        key: data.key,
      };

      clearCart();
      setPlacedOrder(order);
      await startPayment(order);
    } catch (error) {
      setFormError(error.message || 'Unable to place your order. Please try again.');
      setPlacedOrder(null);
      setPaymentState('idle');
    } finally {
      setPlacing(false);
    }
  }

  async function startPayment(order = placedOrder) {
    if (!order) return;
    setPaymentState('paying');
    setPaymentError('');

    try {
      const verified = await completeOrderPayment({
        key: order.key,
        amount: order.amount,
        currency: order.currency,
        orderId: order.razorpayOrderId,
        orderNumber: order.orderNumber,
      });

      setPlacedOrder((current) => ({
        ...current,
        paidAt: verified.order?.paidAt || new Date().toISOString(),
      }));
      setPaymentState('paid');
    } catch (error) {
      if (error.message === PAYMENT_DISMISSED) setPaymentState('pending');
      else {
        await markPaymentFailed(order.orderId).catch(() => {});
        setPaymentError(
          error.description ||
            error.message ||
            'The payment could not be completed. Please try again.',
        );
        setPaymentState('failed');
      }
    }
  }

  if (items.length === 0 && !placedOrder) {
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

  if (placedOrder) {
    const paid = paymentState === 'paid';
    const paying = paymentState === 'paying';
    const pending = paymentState === 'pending';
    const failed = paymentState === 'failed';

    const Icon = paid ? CheckCircle2 : paying ? Loader2 : failed ? XCircle : Clock;
    const title = paid
      ? 'Payment successful!'
      : paying
        ? 'Waiting for payment…'
        : failed
          ? 'Payment failed'
          : 'Payment pending';
    const text = paid
      ? 'Your order has been confirmed. Track it live from your orders.'
      : paying
        ? 'Complete the payment in the popup window to confirm your order.'
        : failed
          ? paymentError ||
            'The payment did not go through, so your order has not been placed. Retry the payment to confirm it.'
          : 'The payment window was closed before completion. Complete the payment to confirm your order.';

    return (
      <div className="checkout-page">
        <AppHeader />
        <main className="checkout-main">
          <BackButton />

          <section className="checkout-success">
            <div className={`checkout-success__icon${paying ? ' checkout-success__icon--spin' : ''}`} aria-hidden="true">
              <Icon size={44} />
            </div>
            <h1 className="checkout-success__title">{title}</h1>
            <p className="checkout-success__text">{text}</p>

            <div className="checkout-success__orders">
              <div className="checkout-success__row">
                <span className="checkout-success__label">
                  Order #{placedOrder.orderNumber}
                </span>
                <span className="checkout-success__value">
                  {formatPrice(Number(placedOrder.amount) / 100)}
                </span>
                {paid ? (
                  <span className="checkout-success__paid">
                    <BadgeCheck size={12} />
                    Paid
                  </span>
                ) : failed ? (
                  <span className="checkout-success__failed">Failed</span>
                ) : (
                  <span className="checkout-success__pending">Pending</span>
                )}
              </div>
              <div className="checkout-success__total">
                <span>{paid ? 'Amount paid' : 'Total payable'}</span>
                <strong>{formatPrice(Number(placedOrder.amount) / 100)}</strong>
              </div>
              {paid && (
                <div className="checkout-success__total">
                  <span>Paid on</span>
                  <strong>{formatDateTime(placedOrder.paidAt)}</strong>
                </div>
              )}
            </div>

            <div className="checkout-success__actions">
              {paid ? (
                <>
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
                </>
              ) : pending || failed ? (
                <>
                  <button
                    className="btn btn--primary"
                    type="button"
                    onClick={() => startPayment()}
                  >
                    {failed ? 'Retry Payment' : 'Pay Now'}
                    <ArrowRight size={18} />
                  </button>
                  <button
                    className="btn btn--secondary"
                    type="button"
                    onClick={() => navigate('/orders')}
                  >
                    View Orders
                  </button>
                </>
              ) : null}
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
