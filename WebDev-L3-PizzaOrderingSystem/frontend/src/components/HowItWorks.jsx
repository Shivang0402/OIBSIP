import { useNavigate } from 'react-router-dom';
import { ArrowRight, Pizza, Sparkles, Truck } from 'lucide-react';
import { Fragment } from 'react';

const STEPS = [
  {
    id: 'pick',
    icon: Pizza,
    title: 'Pick your pizza',
    text: 'Choose from every pizza on the menu, freshly baked to order.',
  },
  {
    id: 'yours',
    icon: Sparkles,
    title: 'Make it yours',
    text: 'Build your own with your favorite base, sauce, cheese and veggies.',
  },
  {
    id: 'track',
    icon: Truck,
    title: 'Track it live',
    text: 'Follow your order from the oven to your doorstep in real time.',
  },
];

function HowItWorks() {
  const navigate = useNavigate();

  return (
    <section className="home-how">
      {STEPS.map((step, index) => {
        const Icon = step.icon;
        return (
          <Fragment key={step.id}>
            <div className="home-how__item">
              <span className="home-how__icon" aria-hidden="true">
                <Icon size={26} />
              </span>
              <h3 className="home-how__title">{step.title}</h3>
              <p className="home-how__text">{step.text}</p>
            </div>
            {index < STEPS.length - 1 && (
              <span className="home-how__connector" aria-hidden="true">
                <ArrowRight size={18} />
              </span>
            )}
          </Fragment>
        );
      })}
      <button className="home-how__cta" type="button" onClick={() => navigate('/pizza-builder')}>
        Start building your pizza
        <ArrowRight size={15} />
      </button>
    </section>
  );
}

export default HowItWorks;
