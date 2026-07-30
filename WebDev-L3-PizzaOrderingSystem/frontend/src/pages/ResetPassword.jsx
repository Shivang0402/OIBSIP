import AuthLayout from '../components/auth/AuthLayout';
import AuthCard from '../components/auth/AuthCard';
import InputField from '../components/auth/InputField';
import PrimaryButton from '../components/auth/PrimaryButton';
import AuthLink from '../components/auth/AuthLink';

function ResetPassword() {
  return (
    <AuthLayout>
      <AuthCard title="Reset password" subtitle="Choose a new password for your account">
        <form className="auth-form">
          <InputField
            id="reset-password"
            label="New Password"
            type="password"
            placeholder="Enter new password"
          />
          <InputField
            id="reset-confirm-password"
            label="Confirm Password"
            type="password"
            placeholder="Confirm new password"
          />

          <PrimaryButton type="submit">Update Password</PrimaryButton>

          <div className="auth-form__footer">
            <p>
              <AuthLink to="/login">Back to Sign In</AuthLink>
            </p>
          </div>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}

export default ResetPassword;
