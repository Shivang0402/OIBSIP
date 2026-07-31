import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';
import AuthCard from '../components/auth/AuthCard';
import PrimaryButton from '../components/auth/PrimaryButton';
import { getUser, clearSession } from '../services/session';

function Home() {
  const navigate = useNavigate();
  const user = getUser();

  function handleSignOut() {
    clearSession();
    navigate('/login');
  }

  return (
    <AuthLayout>
      <AuthCard
        title={`Welcome, ${user?.name || 'pizza lover'}!`}
        subtitle="You are signed in to PizzaNova."
      >
        <div className="auth-status">
          <p className="auth-status__message">
            Signed in as <strong>{user?.email}</strong>. Your order and dashboard pages
            are coming soon — view your profile or sign out below.
          </p>

          <PrimaryButton type="button" onClick={() => navigate('/profile')}>
            View Profile
          </PrimaryButton>

          <PrimaryButton type="button" onClick={handleSignOut}>
            Sign Out
          </PrimaryButton>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}

export default Home;
