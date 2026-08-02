import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  Clock,
  History,
  KeyRound,
  LogOut,
  Mail,
  Package,
  Phone,
  Pizza,
  ShieldCheck,
  Truck,
  UserRound,
  X,
} from 'lucide-react';
import AppHeader from '../components/AppHeader';
import AuthCard from '../components/auth/AuthCard';
import InputField from '../components/auth/InputField';
import PrimaryButton from '../components/auth/PrimaryButton';
import FormMessage from '../components/auth/FormMessage';
import BackButton from '../components/BackButton';
import Footer from '../components/Footer';
import { getProfile, changePassword } from '../services/authService';
import { getOrders } from '../services/orderService';
import { getOrderItems, getOrderNumber } from '../utils/orderItems';
import { clearSession, saveUser, getUser } from '../services/session';
import { isRequired, isStrongEnough } from '../utils/validators';
import '../styles/auth.css';
import '../styles/profile.css';
import '../styles/orders.css';

const DELIVERED_STATUS = ['Delievered', 'Cancelled'];

function isCurrentOrder(order) {
  return !DELIVERED_STATUS.includes(order.orderStatus);
}

function formatPrice(price) {
  return `₹${Number(price).toFixed(2)}`;
}

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function getInitials(name) {
  return (name || 'U')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

function ProfilePage() {
  const navigate = useNavigate();

  const [user, setUser] = useState(getUser());
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [form, setForm] = useState({ currentPass: '', newPass: '', confirmNewPass: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      setLoading(true);
      setLoadError('');
      try {
        const data = await getProfile();
        if (cancelled) return;
        setUser(data.user);
        saveUser({
          id: data.user._id || data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
        });
      } catch (error) {
        if (cancelled) return;
        if (error.status === 401) {
          clearSession();
          navigate('/login', { state: { success: 'Your session expired. Please sign in again.' } });
          return;
        }
        setLoadError(error.message || 'Unable to load your profile.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    async function loadOrders() {
      setOrdersLoading(true);
      setOrdersError('');
      try {
        const data = await getOrders();
        if (!cancelled) setOrders(data.orders || []);
      } catch (error) {
        if (!cancelled) setOrdersError(error.message || 'Unable to load your orders.');
      } finally {
        if (!cancelled) setOrdersLoading(false);
      }
    }

    loadProfile();
    loadOrders();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFormError('');
    setSuccess('');
  }

  function handleSignOut() {
    clearSession();
    navigate('/login');
  }

  function closePasswordForm() {
    setErrors({});
    setFormError('');
    setForm({ currentPass: '', newPass: '', confirmNewPass: '' });
    setShowPasswordForm(false);
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();

    const nextErrors = {};
    if (!isRequired(form.currentPass)) nextErrors.currentPass = 'Current password is required.';
    if (!isRequired(form.newPass)) nextErrors.newPass = 'New password is required.';
    else if (!isStrongEnough(form.newPass)) nextErrors.newPass = 'Password must be at least 6 characters.';
    if (!isRequired(form.confirmNewPass)) nextErrors.confirmNewPass = 'Please confirm your new password.';
    else if (form.newPass !== form.confirmNewPass) nextErrors.confirmNewPass = 'Passwords do not match.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    setFormError('');
    setSuccess('');
    try {
      await changePassword({
        currentPass: form.currentPass,
        newPass: form.newPass,
        confirmNewPass: form.confirmNewPass,
      });
      setForm({ currentPass: '', newPass: '', confirmNewPass: '' });
      setSuccess('Password changed successfully.');
      setShowPasswordForm(false);
    } catch (error) {
      setFormError(error.message);
    } finally {
      setSaving(false);
    }
  }

  const currentOrders = orders.filter(isCurrentOrder);
  const previousOrders = orders.filter((order) => !isCurrentOrder(order));

  return (
    <div className="profile-page">
      <AppHeader />

      <main className="profile-page__content">
        <BackButton />

        {loading && (
          <div className="profile-page__state">
            <div className="profile-page__spinner" aria-hidden="true" />
            <p>Baking your profile&hellip;</p>
          </div>
        )}

        {!loading && loadError && (
          <AuthCard title="Something went wrong" subtitle="We could not load your profile.">
            <FormMessage type="error">{loadError}</FormMessage>
            <PrimaryButton type="button" onClick={() => window.location.reload()}>
              Try Again
            </PrimaryButton>
          </AuthCard>
        )}

        {!loading && !loadError && user && (
          <div className="profile-layout">
            <section className="profile-panel">
              <div className="profile-head">
                <div className="profile-head__avatar" aria-hidden="true">
                  {getInitials(user.name)}
                </div>
                <div className="profile-head__info">
                  <h1 className="profile-head__name">{user.name}</h1>
                  <p className="profile-head__email">{user.email}</p>
                  <div className="profile-head__actions">
                    <button
                      className="profile-mini-link"
                      type="button"
                      onClick={() => setShowPasswordForm((visible) => !visible)}
                    >
                      <KeyRound size={15} />
                      {showPasswordForm ? 'Close password form' : 'Change password'}
                    </button>
                    {user.role === 'admin' && (
                      <button
                        className="profile-mini-link"
                        type="button"
                        onClick={() => navigate('/admin')}
                      >
                        <ShieldCheck size={15} />
                        Admin dashboard
                      </button>
                    )}
                    <button
                      className="profile-mini-link profile-mini-link--danger"
                      type="button"
                      onClick={handleSignOut}
                    >
                      <LogOut size={15} />
                      Sign out
                    </button>
                  </div>
                </div>
              </div>

              {success && <FormMessage type="success">{success}</FormMessage>}

              <div className="profile-divider" />

              <div className="profile-section">
                <h2 className="profile-section__title">Account details</h2>
                <div className="profile-details">
                  <div className="profile-row">
                    <span className="profile-row__label">
                      <UserRound size={15} className="profile-row__icon" />
                      Full Name
                    </span>
                    <span className="profile-row__value">{user.name}</span>
                  </div>
                  <ProfileRow icon={Mail} label="Email" value={user.email} />
                  <ProfileRow icon={Phone} label="Phone" value={user.phone || '—'} />
                  <ProfileRow
                    icon={ShieldCheck}
                    label="Role"
                    value={user.role === 'admin' ? 'Admin' : 'User'}
                  />
                  <ProfileRow
                    icon={CalendarDays}
                    label="Member Since"
                    value={formatDate(user.createdAt)}
                  />
                </div>
              </div>

              {showPasswordForm && (
                <>
                  <div className="profile-divider" />
                  <div className="profile-section">
                    <h2 className="profile-section__title">Change password</h2>
                    {formError && <FormMessage type="error">{formError}</FormMessage>}

                    <form className="auth-form" onSubmit={handlePasswordSubmit} noValidate>
                      <InputField
                        id="current-pass"
                        label="Current Password"
                        type="password"
                        name="currentPass"
                        placeholder="Enter your current password"
                        value={form.currentPass}
                        onChange={handleChange}
                        error={errors.currentPass}
                      />
                      <InputField
                        id="new-pass"
                        label="New Password"
                        type="password"
                        name="newPass"
                        placeholder="At least 6 characters"
                        value={form.newPass}
                        onChange={handleChange}
                        error={errors.newPass}
                      />
                      <InputField
                        id="confirm-new-pass"
                        label="Confirm New Password"
                        type="password"
                        name="confirmNewPass"
                        placeholder="Re-enter your new password"
                        value={form.confirmNewPass}
                        onChange={handleChange}
                        error={errors.confirmNewPass}
                      />

                      <div className="profile-password__actions">
                        <PrimaryButton type="submit" loading={saving}>
                          Update Password
                        </PrimaryButton>
                        <button
                          type="button"
                          className="profile-password__cancel"
                          onClick={closePasswordForm}
                        >
                          <X size={16} />
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </>
              )}
            </section>

            <section className="profile-panel profile-panel--orders">
              <div className="profile-orders">
                {ordersLoading && (
                  <div className="profile-orders__state">
                    <div className="profile-page__spinner" aria-hidden="true" />
                    <p>Loading your orders&hellip;</p>
                  </div>
                )}

                {!ordersLoading && ordersError && (
                  <div className="profile-orders__state">
                    <p className="profile-orders__error">{ordersError}</p>
                  </div>
                )}

                {!ordersLoading && !ordersError && orders.length === 0 && (
                  <div className="profile-orders__state">
                    <div className="profile-orders__empty-icon" aria-hidden="true">
                      <Package size={26} />
                    </div>
                    <p className="profile-orders__empty-title">No orders yet</p>
                    <p className="profile-orders__empty-text">
                      When you place an order, it will show up here.
                    </p>
                  </div>
                )}

                {!ordersLoading && !ordersError && (currentOrders.length > 0 || previousOrders.length > 0) && (
                  <div className="profile-orders-box">
                    {currentOrders.length > 0 && (
                      <div className="profile-orders__group">
                        <h3 className="profile-orders__group-title">
                          <Clock size={15} />
                          Current Orders
                        </h3>
                        <div className="profile-orders__list">
                          {currentOrders.map((order) => (
                            <OrderCard key={order._id} order={order} current />
                          ))}
                        </div>
                      </div>
                    )}
                    {previousOrders.length > 0 && (
                      <div className="profile-orders__group">
                        <h3 className="profile-orders__group-title">
                          <History size={15} />
                          Previous Orders
                        </h3>
                        <div className="profile-orders__list">
                          {previousOrders.map((order) => (
                            <OrderCard key={order._id} order={order} current={false} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

function ProfileRow({ icon: Icon, label, value }) {
  return (
    <div className="profile-row">
      <span className="profile-row__label">
        {Icon && <Icon size={15} className="profile-row__icon" />}
        {label}
      </span>
      <span className="profile-row__value">{value}</span>
    </div>
  );
}

function OrderCard({ order, current }) {
  const navigate = useNavigate();
  const orderItems = getOrderItems(order);
  const first = orderItems[0] || {};
  const snapshot = first.pizzaSnapshot || {};
  const customization = first.customization || {};
  const vegCount = Array.isArray(customization.vegetables) ? customization.vegetables.length : 0;

  function handleTrack() {
    navigate(`/orders/${order._id}`);
  }

  return (
    <article className={`order-card${current ? ' order-card--current' : ''}`}>
      <div className="order-card__top">
        <div className="order-card__thumb" aria-hidden="true">
          <Pizza size={26} />
        </div>
        <div className="order-card__info">
          <h4 className="order-card__name">
            {snapshot.name || 'Pizza'}
            {orderItems.length === 1 && (
              <span className="order-card__qty">× {first.quantity}</span>
            )}
            {orderItems.length > 1 && (
              <span className="order-card__qty">+{orderItems.length - 1} more</span>
            )}
          </h4>
          <p className="order-card__meta">
            #{getOrderNumber(order)} · {formatDate(order.createdAt)}
          </p>
          <p className="order-card__custom">
            {customization.base} · {customization.sauce} · {customization.cheese}
            {vegCount > 0 && <> · +{vegCount} veg</>}
          </p>
        </div>
        <div className="order-card__side">
          <span className="order-badge order-badge--status">{order.orderStatus}</span>
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
      {current && (
        <div className="order-card__actions">
          <button className="order-card__track" type="button" onClick={handleTrack}>
            <Truck size={15} />
            Track Order
          </button>
        </div>
      )}
    </article>
  );
}

export default ProfilePage;
