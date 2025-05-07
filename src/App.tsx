import './index.css';
import { Routes, Route, Navigate } from 'react-router-dom';

// Import the page components
// import { testValue } from './pages/SignUpPage'; // Problematic path still commented
import UserRegistrationPage from './pages/UserRegistrationPage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import ResetPasswordPage from './pages/ResetPasswordPage.tsx'; // Uncommented

function App() {
  // console.log('Critical Test Value:', criticalTestValue); // criticalTestValue no longer exported
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<UserRegistrationPage />} /> {/* Use the new component */}
      <Route path="/reset-password" element={<ResetPasswordPage />} /> {/* Uncommented */}
    </Routes>
  );
}

export default App; 