import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, History, Package, Pizza, ReceiptText, Truck } from 'lucide-react';
import AppHeader from '../components/AppHeader';
import BackButton from '../components/BackButton';
import BottomNav from '../components/BottomNav';
import Footer from '../components/Footer';
import { getOrders } from '../services/orderService';
import { canonicalStatus, isCurrentOrder } from '../utils/orderStatus';
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

  const currentOrders = orders.filter(isCurrentOrder);
  const previousOrders = orders.filter((order) => !isCurrentOrder(order));

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

function OrderCard({ order }) {
  const navigate = useNavigate();
  const snapshot = order.pizzaSnapshot || {};
  const customization = order.customization || {};
  const vegCount = Array.isArray(customization.vegetables) ? customization.vegetables.length : 0;
  const status = canonicalStatus(order.orderStatus);

  function handleOpen() {
    navigate(`/orders/${order._id}`);
  }

  return (
    <article className="order-card order-card--clickable" onClick={handleOpen}>
      <div className="order-card__top">
        <div className="order-card__thumb" aria-hidden="true">
          <Pizza size={24} />
        </div>
        <div className="order-card__info">
          <h3 className="order-card__name">
            {snapshot.name || 'Pizza'} <span className="order-card__qty">× {order.quantity}</span>
          </h3>
          <p className="order-card__meta">
            #{String(order._id).slice(-8)} ·{' '}
            <CalendarDays size={12} /> {formatDate(order.createdAt)}
          </p>
          <p className="order-card__custom">
            {customization.base} · {customization.sauce} · {customization.cheese}
            {vegCount > 0 && <> · +{vegCount} veg</>}
          </p>
        </div>
        <div className="order-card__side">
          <span className="order-badge order-badge--status">{status}</span>
          <span
            className={`order-badge order-badge--payment order-badge--payment-${String(
              order.paymentStatus || 'pending',
            ).toLowerCase()}`}
          >
            {order.paymentStatus}
          </span>
          <strong className="order-card__price">{formatPrice(order.totalPrice)}</strong>
        </div>
      </div>
      <div className="order-card__actions">
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
      </div>
    </article>
  );
}

export default OrdersPage;
