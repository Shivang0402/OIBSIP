import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';
import AuthCard from '../components/auth/AuthCard';
import InputField from '../components/auth/InputField';
import PrimaryButton from '../components/auth/PrimaryButton';
import AuthLink from '../components/auth/AuthLink';
import FormMessage from '../components/auth/FormMessage';
import { adminLogin } from '../services/authService';
import { getToken, saveToken, saveUser } from '../services/session';
import { isRequired, isValidEmail } from '../utils/validators';

function AdminLogin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

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
      const data = await adminLogin({ email: form.email, password: form.password });
      saveToken(data.token);
      saveUser({ id: data.data.id, name: data.data.name, email: data.data.email, role: data.data.role });
      navigate('/admin');
    } catch (error) {
      setFormError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <AuthCard title="Admin Portal" subtitle="Sign in to manage the store">
        {formError && <FormMessage type="error">{formError}</FormMessage>}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <InputField
            id="admin-email"
            label="Email"
            type="email"
            name="email"
            placeholder="admin@pizzanova.com"
            value={form.email}
            onChange={handleChange}
            error={errors.email}
          />
          <InputField
            id="admin-password"
            label="Password"
            type="password"
            name="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
          />

          <PrimaryButton type="submit" loading={loading}>
            Sign In to Dashboard
          </PrimaryButton>

          <div className="auth-form__footer">
            <p>
              Not an admin? <AuthLink to="/login">User login</AuthLink>
            </p>
          </div>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}

export default AdminLogin;
