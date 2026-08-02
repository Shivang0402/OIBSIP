import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import '../styles/back-button.css';

function BackButton({ fallbackTo = '/', label = 'Back' }) {
  const navigate = useNavigate();
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    function onScroll() {
      setHidden(window.scrollY > 160);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function handleBack() {
    const idx = window.history.state?.idx;
    if (typeof idx === 'number' && idx > 0) {
      navigate(-1);
    } else {
      navigate(fallbackTo, { replace: true });
    }
  }

  return (
    <div className={`back-button-wrap${hidden ? ' back-button-wrap--hidden' : ''}`}>
      <button className="back-button" type="button" onClick={handleBack}>
        <ArrowLeft size={16} />
        {label}
      </button>
    </div>
  );
}

export default BackButton;
