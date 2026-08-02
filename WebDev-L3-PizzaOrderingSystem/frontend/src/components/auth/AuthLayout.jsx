import '../../styles/auth.css';
import Logo from '../branding/Logo';
import BackButton from '../BackButton';

function AuthLayout({ children }) {
  return (
    <div className="auth-layout">
      <div className="auth-layout__content">
        <BackButton fallbackTo="/" />

        <div className="auth-layout__brand-panel">
          <Logo variant="full" />
        </div>

        <div className="auth-layout__form">{children}</div>
      </div>
    </div>
  );
}

export default AuthLayout;
