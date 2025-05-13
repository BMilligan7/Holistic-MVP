import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SignUpForm from './SignUpForm';
// import { supabase } from '../../lib/supabaseClient'; // No longer needed directly
import { AuthProvider, useAuth } from '../../contexts/AuthContext';
import { MemoryRouter } from 'react-router-dom';

// Mock react-router-dom's useNavigate
const mockedUseNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...(actual as any), // Cast to any to allow adding properties
    useNavigate: () => mockedUseNavigate,
  };
});

// Define mock functions for all auth operations that useAuth will return
const mockSignUp = vi.fn();
const mockSignIn = vi.fn(); // Add if LoginForm uses it, or for completeness
const mockSignOut = vi.fn(); // Add if needed
const mockResetPassword = vi.fn(); // Add if needed

// Mock the contexts/AuthContext module
vi.mock('../../contexts/AuthContext', async () => {
  const actualAuthContextImport = await vi.importActual('../../contexts/AuthContext');
  
  // A simple MockAuthProvider that doesn't run the problematic useEffect
  const MockAuthProvider = ({ children }: { children: React.ReactNode }) => {
    console.log('[TESTING SignUpForm.test.tsx] MockAuthProvider is rendering.');
    return <>{children}</>;
  };

  return {
    ...(actualAuthContextImport as any), // Spread to keep other exports like ReactNode type if used from actual
    AuthProvider: MockAuthProvider,    // Provide our simplified provider
    useAuth: () => ({                  // Mock the useAuth hook
      user: null, 
      session: null,
      isLoading: false,
      error: null,
      signUp: mockSignUp, 
      // Ensure all properties/methods returned by your actual useAuth are mocked here
      signIn: mockSignIn, 
      signOut: mockSignOut,
      resetPassword: mockResetPassword,
      // onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })), // If needed directly by components
    }),
  };
});

// Helper function to render with providers
// It will now use the MockAuthProvider from our mock
const renderWithProviders = (ui: React.ReactElement) => {
  // Dynamically import AuthProvider here AFTER the mock is set up
  // This is a common pattern to ensure the mocked version is used.
  // However, with vi.mock hoisting, direct import might also work.
  // For safety and clarity, let's ensure it uses the one from the module scope (which is mocked)
  const { AuthProvider } = require('../../contexts/AuthContext'); 

  return render(
    <MemoryRouter>
      <AuthProvider>
        {ui}
      </AuthProvider>
    </MemoryRouter>
  );
};

describe('SignUpForm', () => {
  beforeEach(() => {
    vi.resetAllMocks(); // Vitest's built-in way to reset all mocks
    // mockedUseNavigate.mockReset(); // Covered by vi.resetAllMocks()
    // mockSignUp.mockReset();      // Covered by vi.resetAllMocks()
  });

  it('should render the form elements', () => {
    renderWithProviders(<SignUpForm />); 
    expect(screen.getByRole('heading', { name: /Sign Up/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument(); 
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign Up/i })).toBeInTheDocument();
  });

  it('should display an error message for invalid email format from Supabase', async () => {
    // Use the new top-level mockSignUp directly
    mockSignUp.mockResolvedValueOnce({ 
      error: {
        name: 'AuthApiError',
        message: 'Invalid email address format',
        // ... other error properties
      },
      data: null, // Ensure data is explicitly null or what your app expects
    });

    const user = userEvent.setup();
    renderWithProviders(<SignUpForm />); 

    await user.type(screen.getByLabelText(/Email/i), 'invalid-email'); 
    await user.type(screen.getByLabelText(/^Password$/i), 'ValidPassword123!'); 
    await user.type(screen.getByLabelText(/Confirm Password/i), 'ValidPassword123!');
    
    await user.click(screen.getByRole('button', { name: /Sign Up/i }));

    expect(await screen.findByText(/Invalid email address format/i)).toBeInTheDocument(); 
    expect(mockSignUp).toHaveBeenCalledTimes(1);
  });

  it('should display an error message for a weak password from Supabase', async () => {
    mockSignUp.mockResolvedValueOnce({ 
      error: {
        name: 'AuthApiError',
        message: 'Password should be at least 8 characters and include uppercase, lowercase, and numbers.',
        // ... other error properties
      },
      data: null,
    });

    const user = userEvent.setup();
    renderWithProviders(<SignUpForm />); 

    await user.type(screen.getByLabelText(/Email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/^Password$/i), 'weak'); 
    await user.type(screen.getByLabelText(/Confirm Password/i), 'weak');

    await user.click(screen.getByRole('button', { name: /Sign Up/i }));

    expect(await screen.findByText(/Password should be at least 8 characters/i)).toBeInTheDocument();
    expect(mockSignUp).toHaveBeenCalledTimes(1);
  });

  it('should display "Passwords do not match" error if passwords differ and not call signUp', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SignUpForm />); 

    await user.type(screen.getByLabelText(/Email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/^Password$/i), 'Password123');
    await user.type(screen.getByLabelText(/Confirm Password/i), 'Password456');

    await user.click(screen.getByRole('button', { name: /Sign Up/i }));

    expect(await screen.findByText(/Passwords do not match/i)).toBeInTheDocument();
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('should call useAuth signUp with correct credentials and show success message on successful sign-up', async () => {
    const mockUserData = { id: '123', email: 'test@example.com' }; 
    mockSignUp.mockResolvedValueOnce({ 
      error: null,
      data: { 
        user: mockUserData, 
        session: null 
      }
    });

    const user = userEvent.setup();
    renderWithProviders(<SignUpForm />); 

    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/^Password$/i); 
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);
    const signUpButton = screen.getByRole('button', { name: /Sign Up/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'ValidPassword123!');
    await user.type(confirmPasswordInput, 'ValidPassword123!');
    
    await user.click(signUpButton);

    expect(mockSignUp).toHaveBeenCalledTimes(1);
    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'ValidPassword123!',
    });

    expect(await screen.findByText(/Sign up successful! Please check your email to confirm your account. Redirecting to login.../i)).toBeInTheDocument();
  });

}); 