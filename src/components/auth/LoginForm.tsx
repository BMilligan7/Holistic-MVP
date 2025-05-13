import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('handleSubmit called. Email:', email, 'Password:', password); // ADDED
    setFormError('');

    if (!email || !password) {
      setFormError('Email and password are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error: signInError } = await signIn({ email, password });

    // Inside src/components/auth/LoginForm.tsx
    // Inside the handleSubmit function's try block:

    if (signInError) {
      console.error('Sign In Error from Supabase:', signInError);
      setFormError(signInError.message || 'Failed to sign in. Please check your credentials.');
    } else {
      console.log('Login successful. location.state:', location.state);
      console.log('Login successful. Navigating to "from":', from);
      navigate(from, { replace: true });
    }
// ...
    } catch (err: any) {
      console.error('Caught an exception during sign In:', err);
      setFormError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-white rounded-lg shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
      <form onSubmit={handleSubmit} noValidate>
        {formError && <p className="text-red-600 text-sm mb-4 text-center">{formError}</p>}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
            Email
          </label>
          <input
            className={`appearance-none block w-full px-3 py-2 border ${formError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out`}
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
            Password
          </label>
          <input
            className={`appearance-none block w-full px-3 py-2 border ${formError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out`}
            id="password"
            type="password"
            placeholder="******************"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isSubmitting}
          />
          <div className="text-right mt-1">
            <a
              className="font-medium text-indigo-600 hover:text-indigo-500 text-sm"
              href="/reset-password"
            >
              Forgot Password?
            </a>
          </div>
        </div>
        <div className="mb-5">
          <button
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition duration-150 ease-in-out"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>
        </div>
        <div className="text-center">
          <a
            className="font-medium text-indigo-600 hover:text-indigo-500 text-sm"
            href="/signup"
          >
            Don't have an account? Sign Up
          </a>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;