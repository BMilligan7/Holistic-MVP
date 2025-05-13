import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SignUpForm from './SignUpForm';
// import { supabase } from '../../lib/supabaseClient'; // No longer needed directly
import { AuthProvider, useAuth } from '../../contexts/AuthContext';
import { MemoryRouter } from 'react-router-dom';

// Mock the supabase client module (still needed for AuthProvider internal workings)
vi.mock('../../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
  },
}));

// Mock react-router-dom's useNavigate
const mockedUseNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedUseNavigate,
  };
});

// Define the mock function that will be used by the useAuth mock
const mockSignUpFromAuthContext = vi.fn();

// Mock the contexts/AuthContext module
vi.mock('../../contexts/AuthContext', async () => {
  const actualAuthContext = await vi.importActual('../../contexts/AuthContext');
  return {
    ...actualAuthContext, // Preserve AuthProvider and other potential exports
    useAuth: () => ({     // Mock the useAuth hook
      signUp: mockSignUpFromAuthContext,
      user: null, 
      loading: false,
      // Ensure all properties/methods returned by your actual useAuth are mocked here
      // For example, if useAuth also returns signIn, logOut, etc., they should be here:
      // signIn: vi.fn(), 
      // logOut: vi.fn(),
    }),
  };
});

// Helper function to render with providers
const renderWithProviders = (ui: React.ReactElement) => {
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
    vi.resetAllMocks();
    mockedUseNavigate.mockReset();
    mockSignUpFromAuthContext.mockReset(); // Reset this new mock
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
    const mockSignUp = mockSignUpFromAuthContext; 

    mockSignUp.mockResolvedValueOnce({ 
      error: {
        name: 'AuthApiError',
        message: 'Invalid email address format',
        status: 422,
        code: 'validation_failed',
      },
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
    mockSignUpFromAuthContext.mockResolvedValueOnce({ // Mock the useAuth signUp
      error: {
        name: 'AuthApiError',
        message: 'Password should be at least 8 characters and include uppercase, lowercase, and numbers.',
        status: 422,
        code: 'weak_password',
      },
    });

    const user = userEvent.setup();
    renderWithProviders(<SignUpForm />); 

    await user.type(screen.getByLabelText(/Email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/^Password$/i), 'weak'); 
    await user.type(screen.getByLabelText(/Confirm Password/i), 'weak');

    await user.click(screen.getByRole('button', { name: /Sign Up/i }));

    expect(await screen.findByText(/Password should be at least 8 characters/i)).toBeInTheDocument();
    expect(mockSignUpFromAuthContext).toHaveBeenCalledTimes(1);
  });

  it('should display "Passwords do not match" error if passwords differ and not call signUp', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SignUpForm />); 

    await user.type(screen.getByLabelText(/Email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/^Password$/i), 'Password123');
    await user.type(screen.getByLabelText(/Confirm Password/i), 'Password456'); // Different password

    await user.click(screen.getByRole('button', { name: /Sign Up/i }));

    expect(await screen.findByText(/Passwords do not match/i)).toBeInTheDocument();
    expect(mockSignUpFromAuthContext).not.toHaveBeenCalled(); // Ensure signUp was not called
  });

  it('should call useAuth signUp with correct credentials and show success message on successful sign-up', async () => {
    const mockUser = { id: '123', email: 'test@example.com' }; // Example mock user
    mockSignUpFromAuthContext.mockResolvedValueOnce({ 
      error: null,
      data: { 
        user: mockUser, 
        session: null // Simulate email confirmation needed state
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

    expect(mockSignUpFromAuthContext).toHaveBeenCalledTimes(1);
    expect(mockSignUpFromAuthContext).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'ValidPassword123!',
    });

    expect(await screen.findByText(/Sign up successful! Please check your email to confirm your account. Redirecting to login.../i)).toBeInTheDocument();

    expect(screen.queryByText(/Invalid email address format/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Password should be at least 8 characters/i)).not.toBeInTheDocument();
  });

}); 