import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Pizza } from 'lucide-react';
import AppHeader from '../components/AppHeader';
import BackButton from '../components/BackButton';
import BottomNav from '../components/BottomNav';
import Footer from '../components/Footer';
import PizzaCard from '../components/PizzaCard';
import { getUser } from '../services/session';
import { getPizzas } from '../services/pizzaService';
import '../styles/home.css';
import '../styles/menu.css';

function MenuPage() {
  const navigate = useNavigate();

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
    <div className="menu-page">
      <AppHeader />

      <main className="menu-main">
        <BackButton />

        <section className="menu-head">
          <h1 className="menu-head__title">All Pizzas</h1>
        </section>

        <section className="menu-section">
          {!getUser() && (
            <div className="home-menu-panel">
              <div className="home-menu-panel__icon" aria-hidden="true">
                <Pizza size={24} />
              </div>
              <p>Sign in to explore our menu and place an order.</p>
              <button
                className="btn btn--primary btn--small"
                type="button"
                onClick={() => navigate('/login')}
              >
                Sign In
              </button>
            </div>
          )}

          {getUser() && loading && (
            <div className="home-menu-panel">
              <div className="home-menu-panel__spinner" aria-hidden="true" />
              <p>Loading the menu&hellip;</p>
            </div>
          )}

          {getUser() && !loading && error && (
            <div className="home-menu-panel">
              <div className="home-menu-panel__icon" aria-hidden="true">
                <Pizza size={24} />
              </div>
              <p>{error}</p>
              <button
                className="btn btn--secondary btn--small"
                type="button"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            </div>
          )}

          {getUser() && !loading && !error && pizzas.length === 0 && (
            <div className="home-menu-panel">
              <div className="home-menu-panel__icon" aria-hidden="true">
                <Pizza size={24} />
              </div>
              <p>No pizzas on the menu yet.</p>
            </div>
          )}

          {getUser() && !loading && !error && pizzas.length > 0 && (
            <>
              <div className="home-pizzas">
                {pizzas.map((pizza) => (
                  <PizzaCard key={pizza._id} pizza={pizza} />
                ))}
              </div>
              <button
                className="menu-cta"
                type="button"
                onClick={() => navigate('/pizza-builder')}
              >
                Or build your own
                <ArrowRight size={16} />
              </button>
            </>
          )}
        </section>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}

export default MenuPage;
