import { useNavigate } from 'react-router-dom';
import { ArrowRight, Bike, Pizza, Sparkles } from 'lucide-react';

const STEPS = [
  {
    number: '01',
    icon: Pizza,
    title: 'Pick your pizza',
    text: 'Choose from every pizza on the menu, freshly baked to order.',
  },
  {
    number: '02',
    icon: Sparkles,
    title: 'Make it yours',
    text: 'Build your own with your favorite base, sauce, cheese and veggies.',
  },
  {
    number: '03',
    icon: Bike,
    title: 'Track it live',
    text: 'Follow your order from the oven to your doorstep in real time.',
  },
];

function HowItWorks() {
  const navigate = useNavigate();

  return (
    <section className="home-how">
      {STEPS.map((step) => {
        const Icon = step.icon;
        return (
          <div key={step.number} className="home-how__item">
            <div className="home-how__head">
              <span className="home-how__icon" aria-hidden="true">
                <Icon size={20} />
              </span>
              <span className="home-how__number">{step.number}</span>
            </div>
            <h3 className="home-how__title">{step.title}</h3>
            <p className="home-how__text">{step.text}</p>
          </div>
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
