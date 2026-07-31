import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/branding/Logo';
import AuthCard from '../components/auth/AuthCard';
import InputField from '../components/auth/InputField';
import PrimaryButton from '../components/auth/PrimaryButton';
import FormMessage from '../components/auth/FormMessage';
import { getProfile, changePassword } from '../services/authService';
import { clearSession } from '../services/session';
import { isRequired, isStrongEnough } from '../utils/validators';
import '../styles/auth.css';
import '../styles/profile.css';

function ProfilePage() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [form, setForm] = useState({ currentPass: '', newPass: '', confirmNewPass: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      setLoading(true);
      setLoadError('');
      try {
        const data = await getProfile();
        if (cancelled) return;
        setUser(data.user);
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

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  function getInitials(name) {
    return (name || 'U')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join('');
  }

  function formatDate(value) {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  }

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

  async function handleSubmit(event) {
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
    } catch (error) {
      setFormError(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="profile-page">
      <header className="profile-page__header">
        <div className="profile-page__brand">
          <Logo variant="full" />
        </div>
        <PrimaryButton type="button" onClick={handleSignOut}>
          Sign Out
        </PrimaryButton>
      </header>

      <main className="profile-page__content">
        {loading && (
          <div className="profile-page__state">
            <div className="profile-page__spinner" aria-hidden="true" />
            <p>Loading your profile&hellip;</p>
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
          <>
            <section className="profile-summary">
              <div className="profile-summary__avatar" aria-hidden="true">
                {getInitials(user.name)}
              </div>
              <div className="profile-summary__info">
                <h1 className="profile-summary__name">{user.name}</h1>
                <p className="profile-summary__email">{user.email}</p>
                <div className="profile-summary__badges">
                  <span className="profile-badge">
                    {user.role === 'admin' ? 'Admin' : 'User'}
                  </span>
                  {user.isVerified && (
                    <span className="profile-badge profile-badge--success">Email Verified</span>
                  )}
                </div>
              </div>
            </section>

            <div className="profile-grid">
              <AuthCard title="Profile Details" subtitle="Your account information">
                <div className="profile-details">
                  <ProfileRow label="Full Name" value={user.name} />
                  <ProfileRow label="Email" value={user.email} />
                  <ProfileRow label="Phone" value={user.phone || '—'} />
                  <ProfileRow label="Role" value={user.role === 'admin' ? 'Admin' : 'User'} />
                  <ProfileRow label="Email Verified" value={user.isVerified ? 'Yes' : 'No'} />
                  <ProfileRow label="Member Since" value={formatDate(user.createdAt)} />
                </div>
              </AuthCard>

              <AuthCard
                title="Change Password"
                subtitle="Use a strong password you don't use elsewhere"
              >
                {success && <FormMessage type="success">{success}</FormMessage>}
                {formError && <FormMessage type="error">{formError}</FormMessage>}

                <form className="auth-form" onSubmit={handleSubmit} noValidate>
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

                  <PrimaryButton type="submit" loading={saving}>
                    Update Password
                  </PrimaryButton>
                </form>
              </AuthCard>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function ProfileRow({ label, value }) {
  return (
    <div className="profile-row">
      <span className="profile-row__label">{label}</span>
      <span className="profile-row__value">{value}</span>
    </div>
  );
}

export default ProfilePage;
