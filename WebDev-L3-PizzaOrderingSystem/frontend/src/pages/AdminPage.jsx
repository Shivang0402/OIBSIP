import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Database,
  LayoutDashboard,
  Loader2,
  Package,
  Pizza,
  Plus,
  Save,
  Search,
  ShieldCheck,
  Store,
  X,
} from 'lucide-react';
import AppHeader from '../components/AppHeader';
import BottomNav from '../components/BottomNav';
import Footer from '../components/Footer';
import { getOrders, updateOrderStatus } from '../services/orderService';
import { getPizzas, addPizza, updatePizza } from '../services/pizzaService';
import {
  getInventory,
  addInventory,
  updateInventory,
  getInventoryStats,
} from '../services/inventoryService';
import { getOrderItemsLabel, getOrderNumber } from '../utils/orderItems';
import { canonicalStatus } from '../utils/orderStatus';
import { getUser } from '../services/session';
import '../styles/admin.css';

const ORDER_FLOW = ['Order Received', 'In Kitchen', 'Sent to Delivery'];
const INVENTORY_CATEGORIES = ['base', 'sauce', 'cheese', 'vegetable'];
const ORDER_FILTERS = ['All', 'Pending', 'Order Received', 'In Kitchen', 'Sent to Delivery', 'Cancelled'];

function nextStatusFor(status) {
  const current = canonicalStatus(status);
  if (current === 'Pending') return 'Order Received';
  const index = ORDER_FLOW.indexOf(current);
  return index >= 0 && index < ORDER_FLOW.length - 1 ? ORDER_FLOW[index + 1] : null;
}

function isTerminal(status) {
  const current = canonicalStatus(status);
  return current === 'Cancelled' || current === 'Sent to Delivery';
}

function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function pillTone(status) {
  const current = canonicalStatus(status);
  if (current === 'Order Received') return 'received';
  if (current === 'In Kitchen') return 'kitchen';
  if (current === 'Sent to Delivery') return 'delivery';
  if (current === 'Cancelled') return 'cancelled';
  return 'pending';
}

function StatusPill({ status }) {
  return <span className={`admin-pill admin-pill--${pillTone(status)}`}>{status}</span>;
}

function PaymentPill({ paymentStatus }) {
  const paid = paymentStatus === 'Paid';
  return (
    <span className={`admin-pill admin-pill--${paid ? 'paid' : 'unpaid'}`}>
      {paid ? 'Paid' : paymentStatus || 'Unpaid'}
    </span>
  );
}

function Toggle({ on, disabled, onClick }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      className={`admin-switch${on ? ' admin-switch--on' : ''}`}
      disabled={disabled}
      onClick={onClick}
      title={on ? 'Disable' : 'Enable'}
    >
      <span className="admin-switch__knob" />
    </button>
  );
}

function StockBar({ stock, threshold }) {
  const low = stock <= threshold;
  const warn = !low && stock <= threshold * 2;
  const width = Math.min(100, Math.max(4, (stock / Math.max(threshold * 2, 1)) * 100));
  return (
    <div className="admin-stockbar" title={`${stock} left · threshold ${threshold}`}>
      <span
        className={`admin-stockbar__fill${low ? ' --low' : ''}${warn ? ' --warn' : ''}`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

function StatCard({ icon, label, value, sub, tone }) {
  return (
    <div className="admin-stat">
      <div className={`admin-stat__icon${tone ? ` admin-stat__icon--${tone}` : ''}`}>{icon}</div>
      <div className="admin-stat__meta">
        <span className="admin-stat__label">{label}</span>
        <span className="admin-stat__value">{value}</span>
        {sub && <span className="admin-stat__sub">{sub}</span>}
      </div>
    </div>
  );
}

function Modal({ title, subtitle, onClose, children }) {
  return (
    <div className="admin-modal" role="dialog" aria-modal="true" aria-label={title}>
      <div className="admin-modal__backdrop" onClick={onClose} />
      <div className="admin-modal__panel">
        <header className="admin-modal__head">
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button type="button" className="admin-iconbtn" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </header>
        <div className="admin-modal__body">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children, className = '' }) {
  return (
    <label className={`admin-field ${className}`}>
      <span>{label}</span>
      {children}
    </label>
  );
}

function AdminPage() {
  const user = getUser();
  const [tab, setTab] = useState('overview');

  const [orders, setOrders] = useState([]);
  const [pizzas, setPizzas] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [stats, setStats] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [savingId, setSavingId] = useState('');
  const [focusStockId, setFocusStockId] = useState(null);

  const [modal, setModal] = useState(null);
  const [pizzaForm, setPizzaForm] = useState({ name: '', description: '', price: '', image: '' });
  const [inventoryForm, setInventoryForm] = useState({
    name: '',
    category: 'base',
    unit: '',
    stock: '',
    threshold: '',
  });

  const [orderQuery, setOrderQuery] = useState('');
  const [orderFilter, setOrderFilter] = useState('All');
  const [inventoryFilter, setInventoryFilter] = useState('All');

  const [pizzaEdits, setPizzaEdits] = useState({});
  const [inventoryEdits, setInventoryEdits] = useState({});

  async function fetchAllData() {
    const [ordersRes, pizzasRes, inventoryRes, statsRes] = await Promise.all([
      getOrders(),
      getPizzas(),
      getInventory(),
      getInventoryStats(),
    ]);
    return {
      orders: ordersRes.orders || [],
      pizzas: pizzasRes.pizzas || [],
      inventory: inventoryRes.inventory || [],
      stats: statsRes.data || null,
    };
  }

  async function loadAll() {
    setLoading(true);
    setError('');
    try {
      const data = await fetchAllData();
      setOrders(data.orders);
      setPizzas(data.pizzas);
      setInventory(data.inventory);
      setStats(data.stats);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    fetchAllData()
      .then((data) => {
        if (cancelled) return;
        setOrders(data.orders);
        setPizzas(data.pizzas);
        setInventory(data.inventory);
        setStats(data.stats);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function notify(message) {
    setToast(message);
    window.setTimeout(() => setToast(''), 3200);
  }

  async function advanceOrder(order) {
    const next = nextStatusFor(order.orderStatus);
    if (!next) return;
    setSavingId(order._id);
    try {
      await updateOrderStatus(order._id, next);
      notify(`Order ${getOrderNumber(order)} → ${next}`);
      await loadAll();
    } catch (err) {
      notify(err.message);
    } finally {
      setSavingId('');
    }
  }

  async function cancelOrder(order) {
    setSavingId(order._id);
    try {
      await updateOrderStatus(order._id, 'Cancelled');
      notify(`Order ${getOrderNumber(order)} cancelled`);
      await loadAll();
    } catch (err) {
      notify(err.message);
    } finally {
      setSavingId('');
    }
  }

  async function handleAddPizza(event) {
    event.preventDefault();
    setSavingId('pizza-form');
    try {
      await addPizza({
        name: pizzaForm.name.trim(),
        description: pizzaForm.description.trim(),
        price: Number(pizzaForm.price),
        image: pizzaForm.image.trim(),
      });
      notify(`"${pizzaForm.name.trim()}" added to the menu`);
      setPizzaForm({ name: '', description: '', price: '', image: '' });
      setModal(null);
      await loadAll();
    } catch (err) {
      notify(err.message);
    } finally {
      setSavingId('');
    }
  }

  async function togglePizza(pizza) {
    setSavingId(pizza._id);
    try {
      await updatePizza(pizza._id, { isAvailable: !pizza.isAvailable });
      await loadAll();
    } catch (err) {
      notify(err.message);
    } finally {
      setSavingId('');
    }
  }

  async function savePizza(pizza) {
    const edit = pizzaEdits[pizza._id];
    if (!edit || edit.price === undefined || edit.price === '') return;
    setSavingId(pizza._id);
    try {
      await updatePizza(pizza._id, { price: Number(edit.price) });
      notify(`Price updated for "${pizza.name}"`);
      setPizzaEdits((prev) => {
        const next = { ...prev };
        delete next[pizza._id];
        return next;
      });
      await loadAll();
    } catch (err) {
      notify(err.message);
    } finally {
      setSavingId('');
    }
  }

  async function handleAddInventory(event) {
    event.preventDefault();
    setSavingId('inventory-form');
    try {
      await addInventory({
        name: inventoryForm.name.trim(),
        category: inventoryForm.category,
        unit: inventoryForm.unit.trim() || 'kg',
        stock: Number(inventoryForm.stock),
        threshold: Number(inventoryForm.threshold),
      });
      notify(`"${inventoryForm.name.trim()}" added to inventory`);
      setInventoryForm({ name: '', category: 'base', unit: '', stock: '', threshold: '' });
      setModal(null);
      await loadAll();
    } catch (err) {
      notify(err.message);
    } finally {
      setSavingId('');
    }
  }

  async function toggleInventory(item) {
    setSavingId(item._id);
    try {
      await updateInventory(item._id, { isAvailable: !item.isAvailable });
      await loadAll();
    } catch (err) {
      notify(err.message);
    } finally {
      setSavingId('');
    }
  }

  async function saveInventory(item) {
    const edit = inventoryEdits[item._id];
    if (!edit || (edit.stock === undefined && edit.threshold === undefined)) return;
    setSavingId(item._id);
    try {
      const payload = {};
      if (edit.stock !== undefined && edit.stock !== '') payload.stock = Number(edit.stock);
      if (edit.threshold !== undefined && edit.threshold !== '') payload.threshold = Number(edit.threshold);
      await updateInventory(item._id, payload);
      notify(`Stock updated for "${item.name}"`);
      setInventoryEdits((prev) => {
        const next = { ...prev };
        delete next[item._id];
        return next;
      });
      await loadAll();
    } catch (err) {
      notify(err.message);
    } finally {
      setSavingId('');
    }
  }

  function goRestock(item) {
    setInventoryFilter(item.category || 'All');
    setInventoryEdits((prev) => ({
      ...prev,
      [item._id]: { ...prev[item._id], stock: String(item.stock) },
    }));
    setFocusStockId(item._id);
    setTab('inventory');
    requestAnimationFrame(() => {
      document.getElementById(`inventory-row-${item._id}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    });
  }

  const filteredOrders = useMemo(() => {
    const query = orderQuery.trim().toLowerCase();
    return orders.filter((order) => {
      if (orderFilter !== 'All' && canonicalStatus(order.orderStatus) !== orderFilter) return false;
      if (!query) return true;
      const haystack = `${getOrderNumber(order)} ${getOrderItemsLabel(order)}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [orders, orderQuery, orderFilter]);

  const filteredInventory = useMemo(() => {
    if (inventoryFilter === 'All') return inventory;
    return inventory.filter((item) => item.category === inventoryFilter);
  }, [inventory, inventoryFilter]);

  const lowStockItems = useMemo(
    () => inventory.filter((item) => item.stock <= item.threshold).sort((a, b) => a.stock - b.stock),
    [inventory],
  );

  const overview = useMemo(() => {
    const active = orders.filter((o) => !isTerminal(o.orderStatus));
    const paid = orders.filter((o) => o.paymentStatus === 'Paid');
    return {
      totalOrders: orders.length,
      activeOrders: active.length,
      pendingPayments: orders.length - paid.length,
    };
  }, [orders]);

  const NAV = [
    { key: 'overview', label: 'Overview', icon: <LayoutDashboard size={17} />, count: null },
    { key: 'orders', label: 'Orders', icon: <ClipboardList size={17} />, count: orders.length },
    { key: 'pizzas', label: 'Menu', icon: <Pizza size={17} />, count: pizzas.length },
    {
      key: 'inventory',
      label: 'Inventory',
      icon: <Database size={17} />,
      count: lowStockItems.length,
      alert: true,
    },
  ];

  const TAB_META = {
    overview: { title: 'Overview', subtitle: 'Your store at a glance' },
    orders: { title: 'Orders', subtitle: 'Track, advance and manage incoming orders' },
    pizzas: { title: 'Menu', subtitle: 'Manage the pizzas customers can order' },
    inventory: { title: 'Inventory', subtitle: 'Keep ingredients stocked and available' },
  };

  function renderSidebarNav(className) {
    return NAV.map((item) => (
      <button
        key={item.key}
        type="button"
        className={`${className}__item${tab === item.key ? ` ${className}__item--active` : ''}`}
        onClick={() => setTab(item.key)}
      >
        {item.icon}
        <span>{item.label}</span>
        {item.count !== null && (
          <span className={`${className}__count${item.alert ? ` ${className}__count--alert` : ''}`}>
            {item.count}
          </span>
        )}
      </button>
    ));
  }

  return (
    <div className="admin-page">
      <AppHeader />

      <div className="admin-shell">
        <aside className="admin-sidebar">
          <div className="admin-sidebar__brand">
            <ShieldCheck size={19} />
            PizzaNova <span>Admin</span>
          </div>
          <nav className="admin-sidebar__nav">{renderSidebarNav('admin-sidebar')}</nav>
          {!loading && (
            <div className="admin-sidebar__snapshot">
              <span className="admin-sidebar__snapshot-title">Store snapshot</span>
              <div className="admin-sidebar__snapshot-grid">
                <div>
                  <strong>{overview.totalOrders}</strong>
                  <span>Orders</span>
                </div>
                <div>
                  <strong>{pizzas.length}</strong>
                  <span>Menu</span>
                </div>
                <div>
                  <strong>{stats?.totalItems ?? 0}</strong>
                  <span>Items</span>
                </div>
                <div className="admin-sidebar__snapshot-alert">
                  <strong>{lowStockItems.length}</strong>
                  <span>Low</span>
                </div>
              </div>
            </div>
          )}
          <div className="admin-sidebar__footer">
            <Link className="admin-sidebar__store" to="/">
              <Store size={15} />
              Back to store
            </Link>
            <div className="admin-sidebar__user">
              <span className="admin-sidebar__avatar">
                {(user?.name || 'A')
                  .split(' ')
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((part) => part[0].toUpperCase())
                  .join('')}
              </span>
              <span className="admin-sidebar__user-meta">
                <strong>{user?.name || 'Admin'}</strong>
                <em>Administrator</em>
              </span>
            </div>
          </div>
        </aside>

        <div className="admin-mobilenav">{renderSidebarNav('admin-mobilenav')}</div>

        <main className="admin-content">
          <header className="admin-content__head">
            <div>
              <h1>{TAB_META[tab].title}</h1>
              <p>{TAB_META[tab].subtitle}</p>
            </div>
            {(tab === 'pizzas' || tab === 'inventory') && !loading && (
              <button
                type="button"
                className="admin-btn"
                onClick={() => setModal(tab === 'pizzas' ? 'pizza' : 'inventory')}
              >
                <Plus size={16} />
                Add {tab === 'pizzas' ? 'pizza' : 'item'}
              </button>
            )}
          </header>

          {error && <div className="admin-error">{error}</div>}

          {loading ? (
            <div className="admin-loader">
              <Loader2 size={28} />
              Loading dashboard…
            </div>
          ) : (
            <>
              {tab === 'overview' && (
                <>
                  <section className="admin-stats">
                    <StatCard
                      icon={<ClipboardList size={18} />}
                      label="Total orders"
                      value={overview.totalOrders}
                      sub={`${overview.activeOrders} in progress`}
                    />
                    <StatCard
                      icon={<Package size={18} />}
                      label="Menu items"
                      value={pizzas.length}
                      sub="Live on the store"
                    />
                    <StatCard
                      icon={<Database size={18} />}
                      label="Inventory items"
                      value={stats?.totalItems ?? 0}
                      sub={`${stats?.availableItems ?? 0} available`}
                    />
                    <StatCard
                      icon={<AlertTriangle size={18} />}
                      label="Low stock"
                      value={stats?.lowStockItems ?? 0}
                      sub={`${overview.pendingPayments} unpaid orders`}
                      tone="warn"
                    />
                  </section>

                  <section className="admin-grid">
                    <div className="admin-card">
                      <div className="admin-card__head">
                        <h2>Recent orders</h2>
                        <button
                          type="button"
                          className="admin-card__link"
                          onClick={() => setTab('orders')}
                        >
                          View all <ArrowLeft size={13} style={{ transform: 'rotate(180deg)' }} />
                        </button>
                      </div>
                      {orders.length === 0 ? (
                        <EmptyState icon={<ClipboardList size={22} />} text="No orders yet" />
                      ) : (
                        <div className="admin-list">
                          {orders.slice(0, 5).map((order) => (
                            <div key={order._id} className="admin-listrow">
                              <div className="admin-listrow__main">
                                <strong>{getOrderNumber(order)}</strong>
                                <span>{getOrderItemsLabel(order)}</span>
                              </div>
                              <div className="admin-listrow__side">
                                <span className="admin-listrow__price">₹{order.totalPrice}</span>
                                <StatusPill status={order.orderStatus} />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="admin-card">
                      <div className="admin-card__head">
                        <h2>
                          Low stock alerts
                          {lowStockItems.length > 0 && (
                            <span className="admin-card__count">{lowStockItems.length}</span>
                          )}
                        </h2>
                        <button
                          type="button"
                          className="admin-card__link"
                          onClick={() => setTab('inventory')}
                        >
                          Manage <ArrowLeft size={13} style={{ transform: 'rotate(180deg)' }} />
                        </button>
                      </div>
                      {lowStockItems.length === 0 ? (
                        <EmptyState icon={<Package size={22} />} text="All items well stocked" />
                      ) : (
                        <div className="admin-list">
                          {lowStockItems.map((item) => (
                            <div key={item._id} className="admin-alertrow">
                              <div className="admin-alertrow__main">
                                <strong>{item.name}</strong>
                                <span>
                                  {item.stock} {item.unit} left · threshold {item.threshold}
                                </span>
                              </div>
                              <div className="admin-alertrow__side">
                                {item.lowStockAlertSent && (
                                  <span className="admin-chip admin-chip--alerted">
                                    Alert sent
                                  </span>
                                )}
                                <StockBar stock={item.stock} threshold={item.threshold} />
                                <button
                                  type="button"
                                  className="admin-btn admin-btn--small"
                                  title="Restock — set the amount in inventory"
                                  onClick={() => goRestock(item)}
                                >
                                  <Plus size={13} />
                                  Restock
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </section>
                </>
              )}

              {tab === 'orders' && (
                <section className="admin-card admin-card--flush">
                  <div className="admin-toolbar">
                    <div className="admin-search">
                      <Search size={15} />
                      <input
                        type="text"
                        placeholder="Search orders…"
                        value={orderQuery}
                        onChange={(e) => setOrderQuery(e.target.value)}
                      />
                    </div>
                    <div className="admin-chips">
                      {ORDER_FILTERS.map((filter) => (
                        <button
                          key={filter}
                          type="button"
                          className={`admin-chip${orderFilter === filter ? ' admin-chip--active' : ''}`}
                          onClick={() => setOrderFilter(filter)}
                        >
                          {filter}
                        </button>
                      ))}
                    </div>
                  </div>

                  {filteredOrders.length === 0 ? (
                    <EmptyState icon={<ClipboardList size={24} />} text="No orders match" />
                  ) : (
                    <div className="admin-tablewrap">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Order</th>
                            <th>Items</th>
                            <th>Total</th>
                            <th>Payment</th>
                            <th>Status</th>
                            <th className="admin-table__actions">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredOrders.map((order) => {
                            const next = nextStatusFor(order.orderStatus);
                            const terminal = isTerminal(order.orderStatus);
                            const isPaid = order.paymentStatus === 'Paid';
                            const busy = savingId === order._id;
                            return (
                              <tr key={order._id}>
                                <td data-label="Order">
                                  <span className="admin-cell__order">{getOrderNumber(order)}</span>
                                  <span className="admin-cell__date">{formatDate(order.createdAt)}</span>
                                </td>
                                <td data-label="Items">
                                  <span className="admin-cell__items">{getOrderItemsLabel(order)}</span>
                                </td>
                                <td data-label="Total">
                                  <span className="admin-cell__price">₹{order.totalPrice}</span>
                                </td>
                                <td data-label="Payment">
                                  <PaymentPill paymentStatus={order.paymentStatus} />
                                </td>
                                <td data-label="Status">
                                  <StatusPill status={order.orderStatus} />
                                </td>
                                <td data-label="Actions">
                                  <div className="admin-cell__actions">
                                    {isPaid && next && (
                                      <button
                                        type="button"
                                        className="admin-iconbtn admin-iconbtn--advance"
                                        title={`Mark as ${next}`}
                                        disabled={busy}
                                        onClick={() => advanceOrder(order)}
                                      >
                                        {busy ? <Loader2 size={14} className="admin-spin" /> : <ChevronRight size={15} />}
                                      </button>
                                    )}
                                    {!terminal && (
                                      <button
                                        type="button"
                                        className="admin-iconbtn admin-iconbtn--danger"
                                        title="Cancel order"
                                        disabled={busy}
                                        onClick={() => cancelOrder(order)}
                                      >
                                        <X size={15} />
                                      </button>
                                    )}
                                    {terminal && <span className="admin-cell__done">—</span>}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              )}

              {tab === 'pizzas' && (
                <section className="admin-card admin-card--flush">
                  {pizzas.length === 0 ? (
                    <EmptyState icon={<Pizza size={24} />} text="No pizzas on the menu yet" />
                  ) : (
                    <div className="admin-tablewrap">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Pizza</th>
                            <th>Price</th>
                            <th>Availability</th>
                            <th className="admin-table__actions">Save</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pizzas.map((pizza) => {
                            const edit = pizzaEdits[pizza._id];
                            const dirty = edit?.price !== undefined && edit.price !== '';
                            const busy = savingId === pizza._id;
                            return (
                              <tr key={pizza._id}>
                                <td data-label="Pizza">
                                  <div className="admin-cell__pizza">
                                    {pizza.image ? (
                                      <img src={pizza.image} alt={pizza.name} />
                                    ) : (
                                      <span className="admin-cell__pizza-ph">
                                        <Pizza size={18} />
                                      </span>
                                    )}
                                    <div>
                                      <strong>{pizza.name}</strong>
                                      <span>{pizza.description}</span>
                                    </div>
                                  </div>
                                </td>
                                <td data-label="Price">
                                  <div className="admin-priceinput">
                                    <span>₹</span>
                                    <input
                                      type="number"
                                      min="0"
                                      step="1"
                                      value={edit?.price !== undefined ? edit.price : pizza.price}
                                      onChange={(e) =>
                                        setPizzaEdits({ ...pizzaEdits, [pizza._id]: { price: e.target.value } })
                                      }
                                    />
                                  </div>
                                </td>
                                <td data-label="Availability">
                                  <Toggle
                                    on={pizza.isAvailable}
                                    disabled={busy}
                                    onClick={() => togglePizza(pizza)}
                                  />
                                </td>
                                <td data-label="Save">
                                  {dirty && (
                                    <button
                                      type="button"
                                      className="admin-iconbtn admin-iconbtn--save"
                                      title="Save price"
                                      disabled={busy}
                                      onClick={() => savePizza(pizza)}
                                    >
                                      {busy ? <Loader2 size={14} className="admin-spin" /> : <Save size={14} />}
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              )}

              {tab === 'inventory' && (
                <section className="admin-card admin-card--flush">
                  <div className="admin-toolbar">
                    <div className="admin-chips">
                      {['All', ...INVENTORY_CATEGORIES].map((filter) => (
                        <button
                          key={filter}
                          type="button"
                          className={`admin-chip${inventoryFilter === filter ? ' admin-chip--active' : ''}`}
                          onClick={() => setInventoryFilter(filter)}
                        >
                          {filter}
                        </button>
                      ))}
                    </div>
                  </div>

                  {filteredInventory.length === 0 ? (
                    <EmptyState icon={<Database size={24} />} text="No items in this category" />
                  ) : (
                    <div className="admin-tablewrap">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Item</th>
                            <th>Category</th>
                            <th>Stock level</th>
                            <th>Availability</th>
                            <th className="admin-table__actions">Save</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredInventory.map((item) => {
                            const edit = inventoryEdits[item._id];
                            const dirty =
                              (edit?.stock !== undefined && edit.stock !== '') ||
                              (edit?.threshold !== undefined && edit.threshold !== '');
                            const busy = savingId === item._id;
                            const low = item.stock <= item.threshold;
                            return (
                              <tr key={item._id} id={`inventory-row-${item._id}`}>
                                <td data-label="Item">
                                  <div className="admin-cell__item">
                                    <strong>{item.name}</strong>
                                    <span>
                                      {item.stock} {item.unit}
                                    </span>
                                  </div>
                                </td>
                                <td data-label="Category">
                                  <span className="admin-chip admin-chip--static">{item.category}</span>
                                </td>
                                <td data-label="Stock level">
                                  <div className="admin-cell__stock">
                                    <div className="admin-stockinputs">
                                      <input
                                        type="number"
                                        min="0"
                                        step="1"
                                        title="Stock"
                                        autoFocus={focusStockId === item._id}
                                        onFocus={(e) => {
                                          setFocusStockId(null);
                                          e.target.select();
                                        }}
                                        value={edit?.stock !== undefined ? edit.stock : item.stock}
                                        onChange={(e) =>
                                          setInventoryEdits({
                                            ...inventoryEdits,
                                            [item._id]: { ...edit, stock: e.target.value },
                                          })
                                        }
                                      />
                                      <input
                                        type="number"
                                        min="0"
                                        step="1"
                                        title="Low-stock threshold"
                                        value={edit?.threshold !== undefined ? edit.threshold : item.threshold}
                                        onChange={(e) =>
                                          setInventoryEdits({
                                            ...inventoryEdits,
                                            [item._id]: { ...edit, threshold: e.target.value },
                                          })
                                        }
                                      />
                                    </div>
                                    <StockBar stock={item.stock} threshold={item.threshold} />
                                    {low && <span className="admin-cell__low">Low</span>}
                                  </div>
                                </td>
                                <td data-label="Availability">
                                  <Toggle
                                    on={item.isAvailable}
                                    disabled={busy}
                                    onClick={() => toggleInventory(item)}
                                  />
                                </td>
                                <td data-label="Save">
                                  {dirty && (
                                    <button
                                      type="button"
                                      className="admin-iconbtn admin-iconbtn--save"
                                      title="Save stock"
                                      disabled={busy}
                                      onClick={() => saveInventory(item)}
                                    >
                                      {busy ? <Loader2 size={14} className="admin-spin" /> : <Save size={14} />}
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              )}
            </>
          )}
        </main>
      </div>

      {modal === 'pizza' && (
        <Modal
          title="Add a pizza"
          subtitle="It will appear in the menu as soon as you save."
          onClose={() => setModal(null)}
        >
          <form className="admin-form" onSubmit={handleAddPizza}>
            <Field label="Name">
              <input
                type="text"
                value={pizzaForm.name}
                onChange={(e) => setPizzaForm({ ...pizzaForm, name: e.target.value })}
                placeholder="Margherita"
                required
              />
            </Field>
            <Field label="Price (₹)">
              <input
                type="number"
                min="0"
                step="1"
                value={pizzaForm.price}
                onChange={(e) => setPizzaForm({ ...pizzaForm, price: e.target.value })}
                placeholder="249"
                required
              />
            </Field>
            <Field label="Image URL" className="admin-field--full">
              <input
                type="text"
                value={pizzaForm.image}
                onChange={(e) => setPizzaForm({ ...pizzaForm, image: e.target.value })}
                placeholder="https://… (optional)"
              />
            </Field>
            <Field label="Description" className="admin-field--full">
              <textarea
                rows={3}
                value={pizzaForm.description}
                onChange={(e) => setPizzaForm({ ...pizzaForm, description: e.target.value })}
                placeholder="Fresh tomatoes, mozzarella and basil…"
              />
            </Field>
            <div className="admin-form__actions">
              <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setModal(null)}>
                Cancel
              </button>
              <button type="submit" className="admin-btn" disabled={savingId === 'pizza-form'}>
                {savingId === 'pizza-form' ? (
                  <>
                    <Loader2 size={15} className="admin-spin" /> Adding…
                  </>
                ) : (
                  'Add pizza'
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {modal === 'inventory' && (
        <Modal
          title="Add inventory item"
          subtitle="New items are available to customers immediately."
          onClose={() => setModal(null)}
        >
          <form className="admin-form" onSubmit={handleAddInventory}>
            <Field label="Name" className="admin-field--full">
              <input
                type="text"
                value={inventoryForm.name}
                onChange={(e) => setInventoryForm({ ...inventoryForm, name: e.target.value })}
                placeholder="Paneer"
                required
              />
            </Field>
            <Field label="Category">
              <select
                value={inventoryForm.category}
                onChange={(e) => setInventoryForm({ ...inventoryForm, category: e.target.value })}
              >
                {INVENTORY_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Unit">
              <input
                type="text"
                value={inventoryForm.unit}
                onChange={(e) => setInventoryForm({ ...inventoryForm, unit: e.target.value })}
                placeholder="pieces / kg / litre"
                required
              />
            </Field>
            <Field label="Initial stock">
              <input
                type="number"
                min="0"
                step="1"
                value={inventoryForm.stock}
                onChange={(e) => setInventoryForm({ ...inventoryForm, stock: e.target.value })}
                placeholder="50"
                required
              />
            </Field>
            <Field label="Low-stock threshold">
              <input
                type="number"
                min="0"
                step="1"
                value={inventoryForm.threshold}
                onChange={(e) => setInventoryForm({ ...inventoryForm, threshold: e.target.value })}
                placeholder="10"
                required
              />
            </Field>
            <div className="admin-form__actions">
              <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setModal(null)}>
                Cancel
              </button>
              <button type="submit" className="admin-btn" disabled={savingId === 'inventory-form'}>
                {savingId === 'inventory-form' ? (
                  <>
                    <Loader2 size={15} className="admin-spin" /> Adding…
                  </>
                ) : (
                  'Add item'
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {toast && (
        <div className="admin-toast" role="status">
          <CheckCircle2 size={16} />
          {toast}
        </div>
      )}

      <Footer />
      <BottomNav />
    </div>
  );
}

function EmptyState({ icon, text }) {
  return (
    <div className="admin-empty">
      {icon}
      <span>{text}</span>
    </div>
  );
}

export default AdminPage;
