import './index.css';
import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext'; // Import useAuth

// Import the page components
// import { testValue } from './pages/SignUpPage'; // Problematic path still commented
import UserRegistrationPage from './pages/UserRegistrationPage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import ResetPasswordPage from './pages/ResetPasswordPage.tsx'; // Uncommented

// Placeholder Dashboard Page
const DashboardPage = () => {
  const { user, signOut } = useAuth();
  return (
    <div style={{ padding: '20px' }}>
      <h2>Dashboard</h2>
      <p>Welcome, {user?.email || 'User'}!</p>
      <button onClick={signOut}>Sign Out</button>
      <Outlet /> {/* For nested routes if any */}
    </div>
  );
};

// ProtectedRoute Component
const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // You might want to render a loading spinner here
    return <div>Loading...</div>;
  }

  if (!user) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />; // Or return children directly if not using Outlet for this structure
};

function App() {
  // console.log('Critical Test Value:', criticalTestValue); // criticalTestValue no longer exported
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<UserRegistrationPage />} /> {/* Use the new component */}
      <Route path="/reset-password" element={<ResetPasswordPage />} /> {/* Uncommented */}

      {/* Protected routes wrapper */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        {/* Add other protected routes here, e.g., /profile, /settings */}
      </Route>

      {/* Default route: redirect to dashboard if logged in, else to login */}
      <Route 
        path="/"
        element={
          <AuthAwareRedirect />
        }
      />
      {/* Fallback for any other route - could be a 404 page */}
      {/* <Route path="*" element={<NotFoundPage />} /> */}
    </Routes>
  );
}

// Helper component to handle initial redirect based on auth state
const AuthAwareRedirect = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
};

export default App; 