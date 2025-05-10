import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth(); // Assuming useAuth provides user and overall loading state
  const location = useLocation();

  if (isLoading) {
    // Display a loading indicator while checking auth status
    // This could be a global spinner or a simple text message
    return <div>Loading authentication status...</div>; 
  }

  if (!user) {
    // If not authenticated (no user) and not loading, redirect to login
    // Preserve the intended destination in location state for redirect after login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // If authenticated (user exists), render the children components
  return <>{children}</>;
} 