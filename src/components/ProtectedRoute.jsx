/**
 * Protected Route Component
 * Protects admin routes from unauthorized access
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Loading from './Loading';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Loading fullScreen message="Checking authentication..." />;
  }

  if (!isAuthenticated) {
    // Redirect to login with return URL
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;

