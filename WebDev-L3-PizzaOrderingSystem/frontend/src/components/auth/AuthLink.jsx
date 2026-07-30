import { Link } from 'react-router-dom';

function AuthLink({ to, children }) {
  return (
    <Link to={to} className="auth-link">
      {children}
    </Link>
  );
}

export default AuthLink;
