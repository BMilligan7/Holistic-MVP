import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const ResetPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormMessage('');

    if (!email) {
      setFormError('Email is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Attempting to reset password for:', email);
      const result = await resetPassword(email);
      console.log('Reset password form - result:', result);

      if (result.error) {
        console.error('Reset Password Form Error:', result.error);
        setFormError(result.error.message || 'Failed to send reset link. Please try again.');
      } else {
        // (result.data) would typically be null or an empty object on success for resetPasswordForEmail
        setFormMessage('If an account with that email exists, a password reset link has been sent.');
        setEmail(''); // Clear email field on success
      }
    } catch (err: any) {
      // This catch block handles unexpected errors in the handleSubmit async flow itself,
      // or if resetPassword itself throws an error not caught by its internal try/catch (unlikely for Supabase client).
      console.error('Unexpected error in ResetPasswordForm handleSubmit:', err);
      setFormError(err.message || 'An unexpected error occurred during the reset process.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Reset Password</h2>
      <form onSubmit={handleSubmit} noValidate>
        {formError && <p className="text-red-500 text-sm mb-4">{formError}</p>}
        {formMessage && <p className="text-green-500 text-sm mb-4">{formMessage}</p>}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            Enter your account email
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
        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending Link...' : 'Send Reset Link'}
          </button>
          <a
            className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
            href="/login"
          >
            Back to Login
          </a>
        </div>
      </form>
    </div>
  );
};

export default ResetPasswordForm; 