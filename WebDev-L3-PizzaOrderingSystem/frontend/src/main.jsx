import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import './styles/global.css';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

const tokenPath = window.location.pathname.match(/^\/(verify-email|reset-password)\/([^/]+)\/?$/);
if (tokenPath && !window.location.hash) {
  window.location.replace(`${window.location.pathname}#/${tokenPath[1]}/${tokenPath[2]}`);
}

createRoot(document.getElementById('root')).render(
  <HashRouter>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </HashRouter>
);
