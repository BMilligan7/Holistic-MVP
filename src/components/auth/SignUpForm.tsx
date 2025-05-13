import React, { useState, useEffect, useRef } from 'react'; // Import useRef
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const SignUpForm: React.FC = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ref for the initial focus
  const emailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus the email input field when the component mounts
    emailInputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormMessage('');
    setIsSubmitting(true);

    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      setIsSubmitting(false);
      return;
    }

    try {
      const { data, error: signUpError } = await signUp({ email, password });

      if (signUpError) {
        setFormError(signUpError.message || 'Failed to sign up. Please try again.');
      } else if (data?.user && !data?.session) {
        // This case indicates email confirmation might be needed
        setFormMessage('Sign up successful! Please check your email to confirm your account. Redirecting to login...');
        // Clear form fields
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        // Optional: redirect to login or a confirmation pending page after a delay
        setTimeout(() => {
          navigate('/login');
        }, 3000); // 3-second delay before redirecting
      } else if (data?.user && data?.session) {
        // User is signed up and logged in (e.g. if auto-confirm is on)
        setFormMessage('Sign up and login successful! Redirecting...');
        setTimeout(() => {
          navigate('/'); // Navigate to dashboard or home
        }, 2000);
      } else {
        // Fallback, should not ideally be reached if Supabase client behaves as expected
        setFormError('An unexpected response was received. Please try again.');
      }
    } catch (err: any) {
      setFormError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-white rounded-lg shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
      <form onSubmit={handleSubmit} noValidate>
        {formError && <p className="text-red-600 text-sm mb-4 text-center">{formError}</p>}
        {formMessage && <p className="text-green-600 text-sm mb-4 text-center">{formMessage}</p>}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
            Email
          </label>
          <input
            ref={emailInputRef} // Assign the ref here
            className={`appearance-none block w-full px-3 py-2 border ${formError.includes('email') || formError.includes('Email rate limit exceeded') ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out`}
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
            Password
          </label>
          <input
            className={`appearance-none block w-full px-3 py-2 border ${formError.includes('password') || formError.includes('Password should be at least') ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out`}
            id="password"
            type="password"
            placeholder="******************"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>
        <div className="mb-5"> {/* Changed mb-4 to mb-5 for slightly more spacing before button */}
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="confirmPassword">
            Confirm Password
          </label>
          <input
            className={`appearance-none block w-full px-3 py-2 border ${formError.includes('Passwords do not match') ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out}`}
            id="confirmPassword"
            type="password"
            placeholder="******************"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>
        <div className="mb-5">
          <button
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition duration-150 ease-in-out" 
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing Up...' : 'Sign Up'}
          </button>
        </div>
        <div className="text-center">
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 text-sm">
            Already have an account? Log In
          </Link>
        </div>
      </form>
    </div>
  );
};

export default SignUpForm;

