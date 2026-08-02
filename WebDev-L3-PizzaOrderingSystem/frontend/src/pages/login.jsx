import { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';
import AuthCard from '../components/auth/AuthCard';
import InputField from '../components/auth/InputField';
import PrimaryButton from '../components/auth/PrimaryButton';
import AuthLink from '../components/auth/AuthLink';
import FormMessage from '../components/auth/FormMessage';
import { loginUser } from '../services/authService';
import { getToken, saveToken, saveUser } from '../services/session';
import { isRequired, isValidEmail } from '../utils/validators';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage] = useState(location.state?.success || '');

  if (getToken()) {
    return <Navigate to="/" replace />;
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = {};
    if (!isRequired(form.email)) nextErrors.email = 'Email is required.';
    else if (!isValidEmail(form.email)) nextErrors.email = 'Enter a valid email address.';
    if (!isRequired(form.password)) nextErrors.password = 'Password is required.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    setFormError('');
    try {
      const data = await loginUser({ email: form.email, password: form.password });
      saveToken(data.token);
      saveUser({ id: data.data.id, name: data.data.name, email: data.data.email, role: data.data.role });
      navigate('/');
    } catch (error) {
      setFormError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <AuthCard title="Welcome back" subtitle="Sign in to continue your order">
        {successMessage && <FormMessage type="success">{successMessage}</FormMessage>}
        {formError && <FormMessage type="error">{formError}</FormMessage>}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <InputField
            id="login-email"
            label="Email"
            type="email"
            name="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            error={errors.email}
          />
          <InputField
            id="login-password"
            label="Password"
            type="password"
            name="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
          />

          <PrimaryButton type="submit" loading={loading}>
            Sign In
          </PrimaryButton>

          <div className="auth-form__footer">
            <p>
              Don&apos;t have an account? <AuthLink to="/register">Register</AuthLink>
            </p>
            <p>
              <AuthLink to="/forgot-password">Forgot password?</AuthLink>
            </p>
          </div>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}

export default Login;
