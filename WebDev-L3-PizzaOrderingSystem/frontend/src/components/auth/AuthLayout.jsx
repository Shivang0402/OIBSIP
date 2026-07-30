import Logo from '../branding/Logo';
import '../../styles/auth.css';

function AuthLayout({ children }) {
  return (
    <div className="auth-layout">
      <div className="auth-layout__glow" aria-hidden="true" />

      <div className="auth-layout__content">
        <div className="auth-layout__brand">
          <Logo variant="full" />
          <p className="auth-layout__tagline">Crafted In Every Slice</p>
        </div>

        {children}
      </div>
    </div>
  );
}

export default AuthLayout;
