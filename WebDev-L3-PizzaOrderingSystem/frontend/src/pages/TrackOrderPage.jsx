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
import { subscribeToOrderStatus } from '../services/socket';
import {
  canonicalStatus,
  isTerminalStatus,
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
  const [live, setLive] = useState(false);

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
      setLive(true);
      setOrder((current) => (current ? { ...current, orderStatus: status } : current));
      window.setTimeout(() => setLive(false), 4000);
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

  const snapshot = order.pizzaSnapshot || {};
  const customization = order.customization || {};
  const vegCount = Array.isArray(customization.vegetables) ? customization.vegetables.length : 0;
  const status = canonicalStatus(order.orderStatus);
  const stepIndex = stepIndexForStatus(order.orderStatus);
  const cancelled = status === 'Cancelled';
  const delivered = status === 'Delivered';
  const active = isTerminalStatus(order.orderStatus);

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
                Order #{String(order._id).slice(-8).toUpperCase()}
              </span>
              <h1 className="track-card__title">{delivered ? 'Delivered' : cancelled ? 'Order Cancelled' : 'Live Tracking'}</h1>
              <p className="track-card__meta">
                <CalendarDays size={13} />
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>
            <span
              className={`track-badge track-badge--${cancelled ? 'cancelled' : delivered ? 'delivered' : 'live'}`}
            >
              {live && !active && <span className="track-badge__pulse" aria-hidden="true" />}
              {live && !active ? 'Status updated' : status}
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
              <span className="track-banner__spinner" aria-hidden="true" />
              <span>
                {delivered
                  ? 'Your pizza has been delivered. Enjoy!'
                  : `Your order is ${status}. We'll keep you posted in real time.`}
              </span>
            </div>
          )}

          <div className="track-timeline">
            {TRACK_STEPS.map((step, index) => {
              const done = stepIndex >= 0 ? index <= stepIndex : false;
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
                      {isActiveStep && !done && <span className="track-step__ripple" aria-hidden="true" />}
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
              <div className="track-item__thumb" aria-hidden="true">
                <Pizza size={24} />
              </div>
              <div className="track-item__info">
                <p className="track-item__name">
                  {snapshot.name || 'Pizza'} <span className="track-item__qty">× {order.quantity}</span>
                </p>
                {snapshot.description && (
                  <p className="track-item__desc">{snapshot.description}</p>
                )}
                <p className="track-item__custom">
                  {customization.base} · {customization.sauce} · {customization.cheese}
                  {vegCount > 0 && <> · +{vegCount} veg</>}
                </p>
              </div>
              <strong className="track-item__price">{formatPrice(order.totalPrice)}</strong>
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
              <span>Razorpay Order</span>
              <span className="track-row__value">{order.razorpayOrderId || '—'}</span>
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
