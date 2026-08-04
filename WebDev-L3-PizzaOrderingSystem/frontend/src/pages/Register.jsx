import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';
import AuthCard from '../components/auth/AuthCard';
import InputField from '../components/auth/InputField';
import PrimaryButton from '../components/auth/PrimaryButton';
import AuthLink from '../components/auth/AuthLink';
import FormMessage from '../components/auth/FormMessage';
import { registerUser } from '../services/authService';
import { isRequired, isValidEmail, isStrongEnough, isValidPhone } from '../utils/validators';

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function validate() {
    const nextErrors = {};

    if (!isRequired(form.name)) nextErrors.name = 'Name is required.';
    else if (form.name.trim().length < 2) nextErrors.name = 'Name must be at least 2 characters.';
    if (!isRequired(form.email)) nextErrors.email = 'Email is required.';
    else if (!isValidEmail(form.email)) nextErrors.email = 'Enter a valid email address.';
    if (!isRequired(form.password)) nextErrors.password = 'Password is required.';
    else if (!isStrongEnough(form.password)) nextErrors.password = 'Password must be at least 6 characters.';
    if (!isRequired(form.confirmPassword)) nextErrors.confirmPassword = 'Please confirm your password.';
    else if (form.confirmPassword !== form.password) nextErrors.confirmPassword = 'Passwords do not match.';
    if (!isRequired(form.phone)) nextErrors.phone = 'Phone number is required.';
    else if (!isValidPhone(form.phone)) nextErrors.phone = 'Enter a valid 10-digit phone number.';

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
      await registerUser({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
      });
      navigate('/login', {
        state: {
          success: 'Account created! Please check your email to verify your account.',
        },
      });
    } catch (error) {
      setFormError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <AuthCard title="Create account" subtitle="Join PizzaNova and order artisan pizza">
        {formError && <FormMessage type="error">{formError}</FormMessage>}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <InputField
            id="register-name"
            label="Full Name"
            name="name"
            placeholder="Your name"
            maxLength={50}
            value={form.name}
            onChange={handleChange}
            error={errors.name}
          />
          <InputField
            id="register-email"
            label="Email"
            type="email"
            name="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            error={errors.email}
          />
          <InputField
            id="register-password"
            label="Password"
            type="password"
            name="password"
            placeholder="Create a password"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
          />
          <InputField
            id="register-confirm-password"
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            placeholder="Confirm your password"
            value={form.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
          />
          <InputField
            id="register-phone"
            label="Phone"
            type="tel"
            name="phone"
            placeholder="Your phone number"
            maxLength={10}
            value={form.phone}
            onChange={handleChange}
            error={errors.phone}
          />

          <PrimaryButton type="submit" loading={loading}>
            Create Account
          </PrimaryButton>

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
