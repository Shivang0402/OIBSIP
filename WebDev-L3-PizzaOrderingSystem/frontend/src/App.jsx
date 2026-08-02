import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import MenuPage from './pages/MenuPage';
import PizzaDetailPage from './pages/PizzaDetailPage';
import ProfilePage from './pages/ProfilePage';
import PizzaBuilder from './pages/PizzaBuilder';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import TrackOrderPage from './pages/TrackOrderPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/menu" element={<MenuPage />} />
      <Route
        path="/pizza/:id"
        element={
          <ProtectedRoute>
            <PizzaDetailPage />
          </ProtectedRoute>
        }
      />
      <Route path="/pizza-builder" element={<PizzaBuilder />} />
      <Route path="/cart" element={<CartPage />} />
      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <OrdersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders/:id"
        element={
          <ProtectedRoute>
            <TrackOrderPage />
          </ProtectedRoute>
        }
      />
      <Route path="/login" element={<Login />} />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/verify-email/:token" element={<VerifyEmail />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
