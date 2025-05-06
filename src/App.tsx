// import React from 'react';
import './index.css'
// Import the new components
import SignUpForm from './components/auth/SignUpForm';
import LoginForm from './components/auth/LoginForm';
import ResetPasswordForm from './components/auth/ResetPassword';

function App() {
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-center text-blue-600 mb-10">Auth Form Testing</h1>
      {/* Render the forms side-by-side */}
      <div className="flex flex-col md:flex-row gap-8 justify-around">
        <SignUpForm />
        <LoginForm />
        <ResetPasswordForm />
      </div>
    </div>
  )
}

export default App 