import AuthLayout from '../components/auth/AuthLayout';
import AuthCard from '../components/auth/AuthCard';
import InputField from '../components/auth/InputField';
import PrimaryButton from '../components/auth/PrimaryButton';
import AuthLink from '../components/auth/AuthLink';

function ForgotPassword() {
  return (
    <AuthLayout>
      <AuthCard
        title="Forgot password?"
        subtitle="Enter your email and we'll send you a reset link"
      >
        <form className="auth-form">
          <InputField
            id="forgot-email"
            label="Email"
            type="email"
            placeholder="you@example.com"
          />

          <PrimaryButton type="submit">Send Reset Link</PrimaryButton>

          <div className="auth-form__footer">
            <p>
              Remember your password? <AuthLink to="/login">Back to Sign In</AuthLink>
            </p>
          </div>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}

export default ForgotPassword;
