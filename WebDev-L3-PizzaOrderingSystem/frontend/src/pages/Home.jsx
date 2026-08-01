import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Home as HomeIcon,
  Pizza,
  ReceiptText,
  ShoppingCart,
  User,
} from 'lucide-react';
import AppHeader from '../components/AppHeader';
import { getUser } from '../services/session';
import { getPizzas } from '../services/pizzaService';
import '../styles/home.css';

const HERO_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDJemqz0bDciV5G9Ue22OeqlR8gnYIMy2VhCs0jFbUxO4tU6WaQJo9gB32Py9ZN04ziZC7p9ISpjwAF_dLW3RguYVpri4tg3LpwfFRiXSbArNqr7nKYqCNkFe9jSJeGciDz4-LsEHoZTRgxTNq7Rf4VEZom3UllGPoLBz5UFTjsUoSCMs0IDNEIEXP1f2cdr5X7mJvBQrE0Zl02npqCCia6hhUS4gwBsWUWIIibxYFPFXQbV9askco';

function formatPrice(price) {
  return `₹${Number(price).toFixed(2)}`;
}

function Home() {
  const navigate = useNavigate();
  const user = getUser();

  const [pizzas, setPizzas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadPizzas() {
      if (!getUser()) {
        setLoading(false);
        return;
      }
      try {
        const data = await getPizzas();
        if (!cancelled) setPizzas(data.pizza);
      } catch (loadError) {
        if (!cancelled) setError(loadError.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadPizzas();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="home-page">
      <AppHeader />
      <main className="home-main">
        <section className="home-greeting">
          {user ? (
            <>
              <p className="home-greeting__eyebrow">Welcome back</p>
              <h2 className="home-greeting__title">{user.name.split(' ')[0]}</h2>
              <p className="home-greeting__hint">
                Hungry? Your favorite pizzas are waiting for you.
              </p>
            </>
          ) : (
            <>
              <p className="home-greeting__eyebrow">Welcome to</p>
              <h2 className="home-greeting__title">PizzaNova</h2>
              <p className="home-greeting__hint">
                Sign in to browse the menu and place your first order.
              </p>
            </>
          )}
        </section>

        <section className="home-hero">
          <div className="home-hero__text">
            <span className="home-hero__chip">Freshly Baked Today</span>
            <h1 className="home-hero__title">
              The Future of <span>Pizza</span> is Here.
            </h1>
            <p className="home-hero__subtitle">
              Experience artisanal flavors delivered with tech-speed precision. Your perfect slice
              is just a click away.
            </p>
            <div className="home-hero__actions">
              <button className="btn btn--primary" type="button" onClick={() => navigate('/menu')}>
                Order Now
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
          <div className="home-hero__image-wrap">
            <img
              className="home-hero__image"
              src={HERO_IMAGE}
              alt="Gourmet pepperoni pizza with melting mozzarella and fresh basil"
            />
          </div>
        </section>

        <section className="home-builder-banner">
          <div className="home-builder-banner__content">
            <span className="home-builder-banner__chip">Pizza Customizer</span>
            <h2 className="home-builder-banner__title">Build Your Own Pizza</h2>
            <p className="home-builder-banner__text">
              Pick your base, sauce, cheese and toppings — create your perfect slice from scratch.
            </p>
            <button
              className="btn btn--light"
              type="button"
              onClick={() => navigate('/pizza-builder')}
            >
              Start Building
              <ArrowRight size={18} />
            </button>
          </div>
          <div className="home-builder-banner__art" aria-hidden="true">
            <Pizza size={190} />
          </div>
        </section>

        <section className="home-section">
          <div className="home-section__head">
            <h2 className="home-section__title">Our Menu</h2>
            {user && !loading && !error && pizzas.length > 0 && (
              <button className="home-section__link" type="button" onClick={() => navigate('/menu')}>
                View All Menu
              </button>
            )}
          </div>

          {!user && (
            <div className="home-menu-panel">
              <div className="home-menu-panel__icon" aria-hidden="true">
                <Pizza size={24} />
              </div>
              <p>Sign in to explore our menu and place an order.</p>
              <button className="btn btn--primary btn--small" type="button" onClick={() => navigate('/login')}>
                Sign In
              </button>
            </div>
          )}

          {user && loading && (
            <div className="home-menu-panel">
              <div className="home-menu-panel__spinner" aria-hidden="true" />
              <p>Loading the menu&hellip;</p>
            </div>
          )}

          {user && !loading && error && (
            <div className="home-menu-panel">
              <div className="home-menu-panel__icon" aria-hidden="true">
                <Pizza size={24} />
              </div>
              <p>{error}</p>
              <button className="btn btn--secondary btn--small" type="button" onClick={() => window.location.reload()}>
                Try Again
              </button>
            </div>
          )}

          {user && !loading && !error && pizzas.length === 0 && (
            <div className="home-menu-panel">
              <div className="home-menu-panel__icon" aria-hidden="true">
                <Pizza size={24} />
              </div>
              <p>No pizzas on the menu yet.</p>
            </div>
          )}

          {user && !loading && !error && pizzas.length > 0 && (
            <div className="home-pizzas">
              {pizzas.slice(0, 4).map((pizza) => (
                <Link key={pizza._id} className="home-pizza" to={`/pizza/${pizza._id}`}>
                  <div className="home-pizza__image-wrap">
                    {pizza.image ? (
                      <img className="home-pizza__image" src={pizza.image} alt={pizza.name} />
                    ) : (
                      <div className="home-pizza__image-placeholder" aria-hidden="true">
                        <Pizza size={48} />
                      </div>
                    )}
                    {!pizza.isAvailable && (
                      <span className="home-pizza__unavailable">Unavailable</span>
                    )}
                  </div>
                  <div className="home-pizza__body">
                    <h3 className="home-pizza__name">{pizza.name}</h3>
                    <p className="home-pizza__desc">{pizza.description}</p>
                    <div className="home-pizza__row">
                      <span className="home-pizza__price">{formatPrice(pizza.price)}</span>
                      <span className="home-pizza__view">
                        View
                        <ArrowRight size={16} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="home-footer">
        <div className="home-footer__inner">
          <div className="home-footer__brand">PizzaNova</div>
          <p className="home-footer__copy">© 2024 PizzaNova. Modern Pizzas, Delivered Fast.</p>
        </div>
      </footer>

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
    </div>
  );
}

export default Home;
