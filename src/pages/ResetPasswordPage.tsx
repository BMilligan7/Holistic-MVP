import React from 'react';
import ResetPasswordForm from '../components/auth/ResetPassword'; // Assuming ResetPassword.tsx exports ResetPasswordForm

const ResetPasswordPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <ResetPasswordForm />
    </div>
  );
};

export default ResetPasswordPage; 