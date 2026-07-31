import { useState } from 'react';
import AuthLayout from '../components/auth/AuthLayout';
import AuthCard from '../components/auth/AuthCard';
import InputField from '../components/auth/InputField';
import PrimaryButton from '../components/auth/PrimaryButton';
import AuthLink from '../components/auth/AuthLink';
import FormMessage from '../components/auth/FormMessage';
import { forgotPassword } from '../services/authService';
import { isRequired, isValidEmail } from '../utils/validators';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = {};
    if (!isRequired(email)) nextErrors.email = 'Email is required.';
    else if (!isValidEmail(email)) nextErrors.email = 'Enter a valid email address.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    setFormError('');
    setSuccessMessage('');
    try {
      const data = await forgotPassword(email);
      setSuccessMessage(data.message || 'If that email exists, a reset link is on its way.');
    } catch (error) {
      setFormError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <AuthCard
        title="Forgot password?"
        subtitle="Enter your email and we'll send you a reset link"
      >
        {successMessage && <FormMessage type="success">{successMessage}</FormMessage>}
        {formError && <FormMessage type="error">{formError}</FormMessage>}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <InputField
            id="forgot-email"
            label="Email"
            type="email"
            name="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={errors.email}
          />

          <PrimaryButton type="submit" loading={loading}>
            Send Reset Link
          </PrimaryButton>

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
