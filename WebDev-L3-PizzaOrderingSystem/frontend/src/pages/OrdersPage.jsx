import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  History,
  Loader2,
  Package,
  Pizza,
  ReceiptText,
  RefreshCw,
  Truck,
} from 'lucide-react';
import AppHeader from '../components/AppHeader';
import BackButton from '../components/BackButton';
import BottomNav from '../components/BottomNav';
import Footer from '../components/Footer';
import { getOrders, markPaymentFailed } from '../services/orderService';
import { retryOrderPayment, PAYMENT_DISMISSED } from '../services/paymentService';
import { getOrderItems, getOrderNumber } from '../utils/orderItems';
import { canonicalStatus, isCurrentOrder, needsPayment } from '../utils/orderStatus';
import '../styles/orders.css';

function formatPrice(price) {
  return `₹${Number(price).toFixed(2)}`;
}

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function OrdersPage() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await getOrders();
        if (!cancelled) setOrders(data.orders || []);
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
  }, []);

  async function refreshOrders() {
    try {
      const data = await getOrders();
      setOrders(data.orders || []);
    } catch (refreshError) {
      setError(refreshError.message);
    }
  }

  const unpaidOrders = orders.filter(needsPayment);
  const currentOrders = orders.filter(
    (order) => !needsPayment(order) && isCurrentOrder(order),
  );
  const previousOrders = orders.filter(
    (order) => !needsPayment(order) && !isCurrentOrder(order),
  );

  return (
    <div className="orders-page">
      <AppHeader />

      <main className="orders-main">
        <BackButton />

        <section className="orders-head">
          <h1 className="orders-head__title">Your Orders</h1>
          <p className="orders-head__subtitle">Track current orders or revisit past ones.</p>
        </section>

        {loading && (
          <div className="orders-state">
            <div className="orders-state__spinner" aria-hidden="true" />
            <p>Loading your orders&hellip;</p>
          </div>
        )}

        {!loading && error && (
          <div className="orders-state">
            <div className="orders-state__icon" aria-hidden="true">
              <ReceiptText size={32} />
            </div>
            <p className="orders-state__text">{error}</p>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="orders-state">
            <div className="orders-state__icon" aria-hidden="true">
              <Package size={32} />
            </div>
            <h2 className="orders-state__title">No orders yet</h2>
            <p className="orders-state__text">
              Hungry? Browse the menu and place your first order.
            </p>
            <button className="orders-state__cta" type="button" onClick={() => navigate('/menu')}>
              Browse Menu
            </button>
          </div>
        )}

        {!loading && !error && unpaidOrders.length > 0 && (
          <section className="orders-group">
            <h2 className="orders-group__title">Payment Required</h2>
            <div className="orders-list">
              {unpaidOrders.map((order) => (
                <OrderCard key={order._id} order={order} onChange={refreshOrders} />
              ))}
            </div>
          </section>
        )}

        {!loading && !error && currentOrders.length > 0 && (
          <section className="orders-group">
            <h2 className="orders-group__title">Current Orders</h2>
            <div className="orders-list">
              {currentOrders.map((order) => (
                <OrderCard key={order._id} order={order} />
              ))}
            </div>
          </section>
        )}

        {!loading && !error && previousOrders.length > 0 && (
          <section className="orders-group">
            <h2 className="orders-group__title">Previous Orders</h2>
            <div className="orders-list">
              {previousOrders.map((order) => (
                <OrderCard key={order._id} order={order} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}

function OrderCard({ order, onChange }) {
  const navigate = useNavigate();
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState('');
  const orderItems = getOrderItems(order);
  const first = orderItems[0] || {};
  const snapshot = first.pizzaSnapshot || {};
  const customization = first.customization || {};
  const vegCount = Array.isArray(customization.vegetables) ? customization.vegetables.length : 0;
  const status = canonicalStatus(order.orderStatus);
  const unpaid = needsPayment(order);

  function handleOpen() {
    navigate(`/orders/${order._id}`);
  }

  async function handleRetry(event) {
    event.stopPropagation();
    setRetrying(true);
    setRetryError('');
    try {
      await retryOrderPayment(order._id, getOrderNumber(order));
      if (onChange) await onChange();
    } catch (retryFailure) {
      if (retryFailure.message === PAYMENT_DISMISSED) {
        // Popup closed without completing; order stays pending.
      } else {
        setRetryError(
          retryFailure.description ||
            retryFailure.message ||
            'Payment failed. Please try again.',
        );
        if (order.paymentStatus !== 'Failed' && onChange) {
          try {
            await markPaymentFailed(order._id);
            await onChange();
          } catch {
            // ignore
          }
        }
      }
    } finally {
      setRetrying(false);
    }
  }

  return (
    <article className="order-card order-card--clickable" onClick={handleOpen}>
      <div className="order-card__top">
        <div className="order-card__thumb" aria-hidden="true">
          <Pizza size={24} />
        </div>
        <div className="order-card__info">
          <h3 className="order-card__name">
            {snapshot.name || 'Pizza'}
            {orderItems.length === 1 && (
              <span className="order-card__qty">× {first.quantity}</span>
            )}
            {orderItems.length > 1 && (
              <span className="order-card__qty">+{orderItems.length - 1} more</span>
            )}
          </h3>
          <p className="order-card__meta">
            #{getOrderNumber(order)} ·{' '}
            <CalendarDays size={12} /> {formatDate(order.createdAt)}
          </p>
          <p className="order-card__custom">
            {customization.base} · {customization.sauce} · {customization.cheese}
            {vegCount > 0 && <> · +{vegCount} veg</>}
          </p>
        </div>
        <div className="order-card__side">
          {unpaid ? (
            <span
              className={`order-badge order-badge--payment order-badge--payment-${String(
                order.paymentStatus || 'pending',
              ).toLowerCase()}`}
            >
              {order.paymentStatus || 'Pending'}
            </span>
          ) : (
            <span className="order-badge order-badge--status">{status}</span>
          )}
          <strong className="order-card__price">{formatPrice(order.totalPrice)}</strong>
        </div>
      </div>
      <div className="order-card__actions">
        {unpaid ? (
          <>
            <button
              className="order-card__track"
              type="button"
              onClick={handleRetry}
              disabled={retrying}
            >
              {retrying ? (
                <Loader2 className="orders-state__spin" size={15} />
              ) : (
                <RefreshCw size={15} />
              )}
              {retrying
                ? 'Retrying…'
                : order.paymentStatus === 'Failed'
                  ? 'Retry Payment'
                  : 'Pay Now'}
            </button>
            <button className="order-card__view" type="button" onClick={handleOpen}>
              <ReceiptText size={15} />
              View Order
            </button>
          </>
        ) : (
          <button className="order-card__track" type="button" onClick={handleOpen}>
            {isCurrentOrder(order) ? (
              <>
                <Truck size={15} />
                Track Order
              </>
            ) : (
              <>
                <History size={15} />
                View Order
              </>
            )}
          </button>
        )}
      </div>
      {retryError && <p className="order-card__error">{retryError}</p>}
    </article>
  );
}

export default OrdersPage;
