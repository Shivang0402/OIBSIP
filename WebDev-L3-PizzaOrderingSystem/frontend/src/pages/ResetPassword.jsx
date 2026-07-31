import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';
import AuthCard from '../components/auth/AuthCard';
import InputField from '../components/auth/InputField';
import PrimaryButton from '../components/auth/PrimaryButton';
import AuthLink from '../components/auth/AuthLink';
import FormMessage from '../components/auth/FormMessage';
import { resetPassword } from '../services/authService';
import { isRequired, isStrongEnough } from '../utils/validators';

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function validate() {
    const nextErrors = {};

    if (!isRequired(form.password)) nextErrors.password = 'Password is required.';
    else if (!isStrongEnough(form.password)) nextErrors.password = 'Password must be at least 6 characters.';
    if (!isRequired(form.confirmPassword)) nextErrors.confirmPassword = 'Please confirm your password.';
    else if (form.confirmPassword !== form.password) nextErrors.confirmPassword = 'Passwords do not match.';

    return nextErrors;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    setFormError('');
    try {
      await resetPassword(token, {
        newPass: form.password,
        confirmNewPass: form.confirmPassword,
      });
      navigate('/login', {
        state: { success: 'Password updated! You can now sign in.' },
      });
    } catch (error) {
      setFormError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <AuthCard title="Reset password" subtitle="Choose a new password for your account">
        {formError && <FormMessage type="error">{formError}</FormMessage>}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <InputField
            id="reset-password"
            label="New Password"
            type="password"
            name="password"
            placeholder="Enter new password"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
          />
          <InputField
            id="reset-confirm-password"
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            placeholder="Confirm new password"
            value={form.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
          />

          <PrimaryButton type="submit" loading={loading}>
            Update Password
          </PrimaryButton>

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
