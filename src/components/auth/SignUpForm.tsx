import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // For redirection
import { useAuth } from '../../contexts/AuthContext'; // Import useAuth

const SignUpForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState(''); 
  const [formMessage, setFormMessage] = useState(''); // Added for success/info messages
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormMessage(''); // Clear previous messages
    
    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error: signUpError } = await signUp({ email, password });

      if (signUpError) {
        setFormError(signUpError.message || 'Failed to sign up. Please try again.');
      } else if (data.user && data.session) {
        // User created AND session active (e.g., email auth disabled, or auto-confirmed)
        navigate('/dashboard'); 
      } else if (data.user && !data.session) {
        // User created, but session is null (email confirmation pending)
        setFormMessage('Sign up successful! Please check your email to confirm your account before logging in.');
        setEmail(''); // Clear form
        setPassword('');
        setConfirmPassword('');
      } else {
        // This case might be unusual if no error and no user, or if data format is unexpected.
        // Defaulting to an error or a generic success message prompting email check.
        setFormError('Sign up process completed. Please check your email or try logging in.');
      }
    } catch (err: any) {
      setFormError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
      <form onSubmit={handleSubmit}>
        {formError && <p className="text-red-500 text-sm mb-4">{formError}</p>}
        {formMessage && <p className="text-green-500 text-sm mb-4">{formMessage}</p>} {/* Display success/info message */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            Email
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
            Password
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="password"
            type="password"
            placeholder="******************"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
            Confirm Password
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="confirmPassword"
            type="password"
            placeholder="******************"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing Up...' : 'Sign Up'}
          </button>
          <a
            className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
            href="/login"
          >
            Already have an account? Log In
          </a>
        </div>
      </form>
    </div>
  );
};

export default SignUpForm; 