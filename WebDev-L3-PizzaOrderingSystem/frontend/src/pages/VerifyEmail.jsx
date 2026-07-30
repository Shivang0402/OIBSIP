import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import AuthLayout from '../components/auth/AuthLayout';
import AuthCard from '../components/auth/AuthCard';
import AuthLink from '../components/auth/AuthLink';

const statusConfig = {
  success: {
    icon: CheckCircle2,
    iconClass: 'auth-status__icon--success',
    title: 'Email verified',
    message: 'Your account is ready. You can now sign in and start ordering.',
    showLogin: true,
  },
  error: {
    icon: XCircle,
    iconClass: 'auth-status__icon--error',
    title: 'Verification failed',
    message: 'This link is invalid or has expired. Please request a new verification email.',
    showLogin: false,
  },
  loading: {
    icon: Loader2,
    iconClass: 'auth-status__icon--loading',
    title: 'Verifying email',
    message: 'Please wait while we confirm your email address...',
    showLogin: false,
  },
};

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status') || 'success';
  const config = statusConfig[status] || statusConfig.success;
  const Icon = config.icon;

  return (
    <AuthLayout>
      <AuthCard title={config.title}>
        <div className="auth-status">
          <div className={`auth-status__icon ${config.iconClass}`}>
            <Icon size={32} className={status === 'loading' ? 'auth-status__spin' : ''} />
          </div>
          <p className="auth-status__message">{config.message}</p>

          {config.showLogin && (
            <Link to="/login" className="primary-button primary-button--link">
              Go to Sign In
            </Link>
          )}

          {status === 'error' && (
            <div className="auth-form__footer">
              <p>
                <AuthLink to="/register">Create a new account</AuthLink>
              </p>
            </div>
          )}
        </div>
      </AuthCard>
    </AuthLayout>
  );
}

export default VerifyEmail;
