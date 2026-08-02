import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  CalendarDays,
  Check,
  Loader2,
  MapPin,
  Phone,
  Pizza,
  ReceiptText,
  Truck,
  XCircle,
} from 'lucide-react';
import AppHeader from '../components/AppHeader';
import BackButton from '../components/BackButton';
import BottomNav from '../components/BottomNav';
import Footer from '../components/Footer';
import { getOrderById } from '../services/orderService';
import { getOrderItems, getOrderNumber } from '../utils/orderItems';
import { subscribeToOrderStatus } from '../services/socket';
import {
  canonicalStatus,
  stepIndexForStatus,
  TRACK_STEPS,
} from '../utils/orderStatus';
import '../styles/orders.css';

function formatPrice(price) {
  return `₹${Number(price).toFixed(2)}`;
}

function formatDate(value) {
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

function TrackOrderPage() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await getOrderById(id);
        if (!cancelled) setOrder(data.order);
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

  useEffect(() => {
    if (!id) return undefined;

    const unsubscribe = subscribeToOrderStatus(id, (status) => {
      setOrder((current) => (current ? { ...current, orderStatus: status } : current));
    });

    return unsubscribe;
  }, [id]);

  if (loading) {
    return (
      <div className="orders-page">
        <AppHeader />
        <main className="orders-main">
          <BackButton />
          <div className="orders-state">
            <Loader2 className="orders-state__spin" size={32} />
            <p>Loading your order&hellip;</p>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="orders-page">
        <AppHeader />
        <main className="orders-main">
          <BackButton />
          <div className="orders-state">
            <div className="orders-state__icon" aria-hidden="true">
              <XCircle size={32} />
            </div>
            <h1 className="orders-state__title">Order not found</h1>
            <p className="orders-state__text">{error || 'We could not find that order.'}</p>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  const orderItems = getOrderItems(order);
  const status = canonicalStatus(order.orderStatus);
  const stepIndex = stepIndexForStatus(order.orderStatus);
  const cancelled = status === 'Cancelled';
  const delivered = status === 'Delivered' || status === 'Sent to Delivery';

  return (
    <div className="orders-page">
      <AppHeader />

      <main className="orders-main">
        <BackButton />

        <section className="track-card">
          <div className="track-card__head">
            <div className="track-card__icon" aria-hidden="true">
              <Truck size={24} />
            </div>
            <div className="track-card__info">
              <span className="track-card__label">
                Order #{getOrderNumber(order)}
              </span>
              <h1 className="track-card__title">{delivered ? 'Out for Delivery' : cancelled ? 'Order Cancelled' : 'Live Tracking'}</h1>
              <p className="track-card__meta">
                <CalendarDays size={13} />
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>
            <span
              className={`track-badge track-badge--${cancelled ? 'cancelled' : delivered ? 'delivered' : 'live'}`}
            >
              {status}
            </span>
          </div>

          {cancelled ? (
            <div className="track-banner track-banner--cancelled">
              <XCircle size={20} />
              <span>
                This order was cancelled. Contact support if you believe this is a mistake.
              </span>
            </div>
          ) : (
            <div className="track-banner track-banner--active">
              <span>
                {delivered
                  ? 'Your pizza is out for delivery and will reach you soon. Enjoy!'
                  : `Your order is ${status}. We'll keep you posted in real time.`}
              </span>
            </div>
          )}

          <div className="track-timeline">
            <div className="track-step track-step--done">
              <div className="track-step__row">
                <span className="track-step__dot">
                  <Check size={12} />
                </span>
                <span className="track-step__connector" aria-hidden="true" />
              </div>
              <span className="track-step__label">Order Placed</span>
            </div>
            {TRACK_STEPS.map((step, index) => {
              const done = stepIndex >= 0 && index <= stepIndex;
              const isActiveStep = stepIndex >= 0 && index === stepIndex;
              return (
                <div
                  key={step}
                  className={`track-step${done ? ' track-step--done' : ''}${
                    isActiveStep ? ' track-step--active' : ''
                  }${cancelled && done ? ' track-step--cancelled' : ''}`}
                >
                  <div className="track-step__row">
                    <span className="track-step__dot">
                      {done && <Check size={12} />}
                    </span>
                    {index < TRACK_STEPS.length - 1 && (
                      <span className="track-step__connector" aria-hidden="true" />
                    )}
                  </div>
                  <span className="track-step__label">{step}</span>
                </div>
              );
            })}
          </div>
        </section>

        <div className="track-grid">
          <section className="track-panel">
            <h2 className="track-panel__title">
              <Pizza size={17} />
              Items
            </h2>
            <div className="track-item">
              {orderItems.map((item) => {
                const snapshot = item.pizzaSnapshot || {};
                const customization = item.customization || {};
                const vegCount = Array.isArray(customization.vegetables)
                  ? customization.vegetables.length
                  : 0;
                return (
                  <div key={item._id || item.pizzaId || snapshot.name} className="track-item__row">
                    <div className="track-item__thumb" aria-hidden="true">
                      <Pizza size={24} />
                    </div>
                    <div className="track-item__info">
                      <p className="track-item__name">
                        {snapshot.name || 'Pizza'}{' '}
                        <span className="track-item__qty">× {item.quantity}</span>
                      </p>
                      {snapshot.description && (
                        <p className="track-item__desc">{snapshot.description}</p>
                      )}
                      <p className="track-item__custom">
                        {customization.base} · {customization.sauce} · {customization.cheese}
                        {vegCount > 0 && <> · +{vegCount} veg</>}
                      </p>
                    </div>
                    <strong className="track-item__price">
                      {formatPrice(item.totalPrice || snapshot.price * item.quantity)}
                    </strong>
                  </div>
                );
              })}
            </div>
            <div className="track-item__total">
              <span>Total</span>
              <strong>{formatPrice(order.totalPrice)}</strong>
            </div>
          </section>

          <section className="track-panel">
            <h2 className="track-panel__title">
              <MapPin size={17} />
              Delivery Address
            </h2>
            <p className="track-address__line">
              {order.deliveryAddress?.street ? `${order.deliveryAddress.street}, ` : ''}
              {order.deliveryAddress?.area}
            </p>
            <p className="track-address__line">
              {order.deliveryAddress?.city}, {order.deliveryAddress?.state} -{' '}
              {order.deliveryAddress?.pincode}
            </p>
            <p className="track-address__hint">
              <Phone size={13} />
              Our rider may call you for directions.
            </p>
          </section>

          <section className="track-panel">
            <h2 className="track-panel__title">
              <ReceiptText size={17} />
              Payment
            </h2>
            <div className="track-row">
              <span>Status</span>
              <span
                className={`track-badge track-badge--pay track-badge--pay-${String(
                  order.paymentStatus || 'pending',
                ).toLowerCase()}`}
              >
                {order.paymentStatus}
              </span>
            </div>
            <div className="track-row">
              <span>Payment ID</span>
              <span className="track-row__value">
                {order.razorpayPaymentId || '—'}
              </span>
            </div>
            <div className="track-row">
              <span>Paid on</span>
              <span className="track-row__value">{formatDate(order.paidAt)}</span>
            </div>
          </section>
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}

export default TrackOrderPage;
