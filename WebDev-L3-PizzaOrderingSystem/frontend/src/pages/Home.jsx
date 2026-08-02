import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Pizza } from 'lucide-react';
import AppHeader from '../components/AppHeader';
import ActiveOrderStrip from '../components/ActiveOrderStrip';
import BottomNav from '../components/BottomNav';
import Footer from '../components/Footer';
import HowItWorks from '../components/HowItWorks';
import PizzaCard from '../components/PizzaCard';
import { getUser } from '../services/session';
import { getPizzas } from '../services/pizzaService';
import '../styles/home.css';

const HERO_IMAGES = [
  '/uploads/hero/hero-1.jpg',
  '/uploads/hero/hero-2.jpg',
  '/uploads/hero/hero-3.jpg',
  '/uploads/hero/hero-4.jpg',
];

function Home() {
  const navigate = useNavigate();
  const user = getUser();

  const [pizzas, setPizzas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((current) => (current + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

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
        <section className="home-hero">
          <div className="home-hero__bg" aria-hidden="true">
            {HERO_IMAGES.map((src, index) => (
              <img
                key={src}
                className={`home-hero__bg-image${index === heroIndex ? ' home-hero__bg-image--active' : ''}`}
                src={src}
                alt=""
              />
            ))}
            <div className="home-hero__overlay" />
          </div>
          <div className="home-hero__content">
            <div className="home-hero__greeting">
              <p className="home-hero__greeting-eyebrow">{user ? 'Welcome back' : 'Welcome to'}</p>
              <h2 className="home-hero__greeting-name">
                {user ? user.name.split(' ')[0] : 'PizzaNova'}
              </h2>
            </div>
            <span className="home-hero__chip">Freshly baked today</span>
            <h1 className="home-hero__title">
              Handcrafted <span>Pizza</span>. Delivered Fresh.
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
        </section>

        <HowItWorks />

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
            <>
              <div className="home-pizzas">
                {pizzas.slice(0, 4).map((pizza) => (
                  <PizzaCard key={pizza._id} pizza={pizza} />
                ))}
              </div>
              <div className="home-browse">
                <button className="home-browse__link" type="button" onClick={() => navigate('/menu')}>
                  Browse the full menu
                  <ArrowRight size={16} />
                </button>
              </div>
            </>
          )}

          <ActiveOrderStrip />
        </section>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}

export default Home;
