import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ReceiptText } from 'lucide-react';
import { getUser } from '../services/session';
import { getOrders } from '../services/orderService';

const STATUS_STEPS = ['Order Recevied', 'In Kitchen', 'On the way', 'Delievered'];

function ActiveOrderStrip() {
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!getUser()) {
        setLoaded(true);
        return;
      }
      try {
        const data = await getOrders();
        const active = (data.orders || []).find(
          (o) => o.paymentStatus !== 'Failed' && o.orderStatus !== 'Delievered',
        );
        if (!cancelled) setOrder(active || null);
      } catch {
        // strip is optional — hide silently on failure
      } finally {
        if (!cancelled) setLoaded(true);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!loaded || !order) return null;

  const stepIndex = STATUS_STEPS.indexOf(order.orderStatus);
  const progress = stepIndex < 0 ? 100 : ((stepIndex + 1) / STATUS_STEPS.length) * 100;
  const shortId = String(order._id).slice(-6).toUpperCase();
  const itemLabel = order.pizzaSnapshot?.name
    ? `${order.pizzaSnapshot.name} × ${order.quantity}`
    : `Order ${shortId}`;

  return (
    <section className="home-order">
      <div className="home-order__icon" aria-hidden="true">
        <ReceiptText size={20} />
      </div>
      <div className="home-order__info">
        <span className="home-order__label">Active order · #{shortId}</span>
        <strong className="home-order__name">{itemLabel}</strong>
      </div>
      <div className="home-order__track">
        <div className="home-order__bar">
          <span style={{ width: `${progress}%` }} />
        </div>
        <span className="home-order__status">{order.orderStatus}</span>
      </div>
      <button className="home-order__cta" type="button" onClick={() => navigate('/orders')}>
        Track
        <ArrowRight size={14} />
      </button>
    </section>
  );
}

export default ActiveOrderStrip;
