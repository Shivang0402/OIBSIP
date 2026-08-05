import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingCart, User } from 'lucide-react';
import { getUser } from '../services/session';
import { getCartCount } from '../services/cartService';
import '../styles/header.css';

function getInitials(name) {
  return (name || 'U')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

const navLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/menu', label: 'Menu' },
  { to: '/pizza-builder', label: 'Customize' },
  { to: '/orders', label: 'Track Order' },
];

function AppHeader() {
  const navigate = useNavigate();
  const user = getUser();
  const cartCount = getCartCount();

  function openProfile() {
    navigate(user ? '/profile' : '/login');
  }

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <div className="app-header__left">
          <Link className="app-header__brand" to="/">
            PizzaNova
          </Link>
          <nav className="app-header__links" aria-label="Main">
            {navLinks.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `app-header__link${isActive ? ' app-header__link--active' : ''}`
                }
              >
                {label}
              </NavLink>
            ))}
            {user?.role === 'admin' && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `app-header__link app-header__link--admin${isActive ? ' app-header__link--active' : ''}`
                }
              >
                Admin
              </NavLink>
            )}
          </nav>
        </div>

        <div className="app-header__right">
          <NavLink
            to="/cart"
            className={({ isActive }) =>
              `app-header__icon${isActive ? ' app-header__icon--active' : ''}`
            }
            aria-label="Cart"
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && <span className="app-header__badge">{cartCount}</span>}
          </NavLink>
          {user ? (
            <button
              className="app-header__avatar"
              type="button"
              onClick={openProfile}
              aria-label="Open profile"
              title={`Signed in as ${user.name}`}
            >
              {getInitials(user.name)}
            </button>
          ) : (
            <button className="app-header__signin" type="button" onClick={() => navigate('/login')}>
              <User size={16} />
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default AppHeader;
