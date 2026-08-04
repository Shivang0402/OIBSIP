import { Navigate } from 'react-router-dom';
import { getToken, getUser } from '../services/session';

function AdminRoute({ children }) {
  if (!getToken()) {
    return <Navigate to="/admin-login" replace />;
  }
  if (getUser()?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default AdminRoute;
