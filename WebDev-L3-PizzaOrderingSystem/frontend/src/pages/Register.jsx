import AuthLayout from '../components/auth/AuthLayout';
import AuthCard from '../components/auth/AuthCard';
import InputField from '../components/auth/InputField';
import PrimaryButton from '../components/auth/PrimaryButton';
import AuthLink from '../components/auth/AuthLink';

function Register() {
  return (
    <AuthLayout>
      <AuthCard title="Create account" subtitle="Join PizzaNova and order artisan pizza">
        <form className="auth-form">
          <InputField id="register-name" label="Full Name" placeholder="Your name" />
          <InputField
            id="register-email"
            label="Email"
            type="email"
            placeholder="you@example.com"
          />
          <InputField
            id="register-password"
            label="Password"
            type="password"
            placeholder="Create a password"
          />
          <InputField
            id="register-confirm-password"
            label="Confirm Password"
            type="password"
            placeholder="Confirm your password"
          />
          <InputField
            id="register-phone"
            label="Phone"
            type="tel"
            placeholder="Your phone number"
          />

          <PrimaryButton type="submit">Create Account</PrimaryButton>

          <div className="auth-form__footer">
            <p>
              Already have an account? <AuthLink to="/login">Sign In</AuthLink>
            </p>
          </div>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}

export default Register;
