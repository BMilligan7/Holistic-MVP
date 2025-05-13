import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SignUpForm from './SignUpForm';
// Import the AuthProvider here. Due to vi.mock, it will be our MockAuthProvider.
import { AuthProvider } from '../../contexts/AuthContext'; 
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
const mockSignIn = vi.fn(); 
const mockSignOut = vi.fn(); 
const mockResetPassword = vi.fn();

// Mock the contexts/AuthContext module
vi.mock('../../contexts/AuthContext', async () => {
  const actualAuthContextImport = await vi.importActual('../../contexts/AuthContext');
  
  const MockAuthProviderComponent = ({ children }: { children: React.ReactNode }) => {
    console.log('[TESTING SignUpForm.test.tsx] MockAuthProvider is rendering.');
    return <>{children}</>;
  };

  return {
    ...(actualAuthContextImport as any), 
    AuthProvider: MockAuthProviderComponent, // Export our mock provider as AuthProvider
    useAuth: () => ({                  
      user: null, 
      session: null,
      isLoading: false,
      error: null,
      signUp: mockSignUp, 
      signIn: mockSignIn, 
      signOut: mockSignOut,
      resetPassword: mockResetPassword,
    }),
  };
});

// Helper function to render with providers
const renderWithProviders = (ui: React.ReactElement) => {
  // AuthProvider is now imported at the top and is already our mocked version.
  return render(
    <MemoryRouter>
      <AuthProvider> {/* This uses the mocked AuthProvider from the top import */}
        {ui}
      </AuthProvider>
    </MemoryRouter>
  );
};


describe('SignUpForm', () => {
  beforeEach(() => {
    vi.resetAllMocks(); 
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
    mockSignUp.mockResolvedValueOnce({ 
      error: {
        name: 'AuthApiError',
        message: 'Invalid email address format',
      },
      data: null, 
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