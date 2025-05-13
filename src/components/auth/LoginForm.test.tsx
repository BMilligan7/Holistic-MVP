import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoginForm from './LoginForm';
// import { AuthProvider, useAuth } from '../../contexts/AuthContext'; // Will be mocked
import { MemoryRouter } from 'react-router-dom'; 

// Remove the old supabaseClient mock
// vi.mock('../../lib/supabaseClient', () => ({ ... }));

// Mock react-router-dom's useNavigate
const mockedUseNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...(actual as any), 
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
  
  const MockAuthProvider = ({ children }: { children: React.ReactNode }) => {
    console.log('[TESTING LoginForm.test.tsx] MockAuthProvider is rendering.');
    return <>{children}</>;
  };

  return {
    ...(actualAuthContextImport as any), 
    AuthProvider: MockAuthProvider,    
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
  const { AuthProvider } = require('../../contexts/AuthContext');
  return render(
    <MemoryRouter>
      <AuthProvider>
        {ui}
      </AuthProvider>
    </MemoryRouter>
  );
};

describe('LoginForm', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should render the form elements', () => {
    renderWithProviders(<LoginForm />); 
    expect(screen.getByRole('heading', { name: /Login/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument(); 
    expect(screen.getByText(/Forgot Password\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Don\'t have an account\? Sign Up/i)).toBeInTheDocument();
  });

  it('should display an error message for invalid credentials from Supabase', async () => {
    mockSignIn.mockResolvedValueOnce({ 
      error: {
        name: 'AuthApiError',
        message: 'Invalid login credentials', 
        // ... other error properties
      },
      data: null, // Or user: null, session: null, depending on your signIn service structure
    });

    const user = userEvent.setup();
    renderWithProviders(<LoginForm />); 

    await user.type(screen.getByLabelText(/Email/i), 'user@example.com');
    await user.type(screen.getByLabelText(/Password/i), 'wrongPassword123!');
    await user.click(screen.getByRole('button', { name: /Sign In/i }));

    expect(await screen.findByText(/Invalid login credentials/i)).toBeInTheDocument(); 
    expect(mockSignIn).toHaveBeenCalledTimes(1);
  });

  it('should call useAuth signIn with correct credentials and navigate on successful login', async () => {
    mockSignIn.mockResolvedValueOnce({ 
      error: null,
      data: { user: { id: '456', email: 'test@example.com' }, session: { /* mock session */ } },
    });

    const user = userEvent.setup();
    renderWithProviders(<LoginForm />); 

    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const loginButton = screen.getByRole('button', { name: /Sign In/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'CorrectPassword123!');
    await user.click(loginButton);

    expect(mockSignIn).toHaveBeenCalledTimes(1);
    expect(mockSignIn).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'CorrectPassword123!',
    });

    expect(screen.queryByText(/Invalid login credentials/i)).not.toBeInTheDocument();
    expect(mockedUseNavigate).toHaveBeenCalledWith("/", { replace: true });
  });

}); 