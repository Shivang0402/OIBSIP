import { NavLink } from 'react-router-dom';
import { Home as HomeIcon, Pizza, ReceiptText, ShoppingCart, User } from 'lucide-react';

function BottomNav() {
  return (
    <nav className="home-bottom-nav" aria-label="Mobile">
      <NavLink
        to="/"
        className={({ isActive }) =>
          `home-bottom-nav__item${isActive ? ' home-bottom-nav__item--active' : ''}`
        }
      >
        <HomeIcon size={20} />
        <span>Home</span>
      </NavLink>
      <NavLink
        to="/menu"
        className={({ isActive }) =>
          `home-bottom-nav__item${isActive ? ' home-bottom-nav__item--active' : ''}`
        }
      >
        <Pizza size={20} />
        <span>Menu</span>
      </NavLink>
      <NavLink
        to="/cart"
        className={({ isActive }) =>
          `home-bottom-nav__item${isActive ? ' home-bottom-nav__item--active' : ''}`
        }
      >
        <ShoppingCart size={20} />
        <span>Cart</span>
      </NavLink>
      <NavLink
        to="/orders"
        className={({ isActive }) =>
          `home-bottom-nav__item${isActive ? ' home-bottom-nav__item--active' : ''}`
        }
      >
        <ReceiptText size={20} />
        <span>Orders</span>
      </NavLink>
      <NavLink
        to="/profile"
        className={({ isActive }) =>
          `home-bottom-nav__item${isActive ? ' home-bottom-nav__item--active' : ''}`
        }
      >
        <User size={20} />
        <span>Profile</span>
      </NavLink>
    </nav>
  );
}

export default BottomNav;
