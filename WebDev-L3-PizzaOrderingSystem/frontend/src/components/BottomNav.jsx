import { NavLink } from 'react-router-dom';
import { Home as HomeIcon, Pizza, ReceiptText, ShoppingCart, User } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Home', icon: HomeIcon },
  { to: '/menu', label: 'Menu', icon: Pizza },
  { to: '/cart', label: 'Cart', icon: ShoppingCart },
  { to: '/orders', label: 'Orders', icon: ReceiptText },
  { to: '/profile', label: 'Profile', icon: User },
];

function BottomNav() {
  return (
    <nav className="home-bottom-nav" aria-label="Mobile">
      {navItems.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `home-bottom-nav__item${isActive ? ' home-bottom-nav__item--active' : ''}`
          }
        >
          <Icon size={20} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export default BottomNav;
