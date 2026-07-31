import { Navigate } from 'react-router-dom';
import { getToken } from '../services/session';

function ProtectedRoute({ children }) {
  if (!getToken()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default ProtectedRoute;
