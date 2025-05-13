import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoginForm from './LoginForm';
// import { supabase } from '../../lib/supabaseClient'; // No longer needed directly for spy
import { AuthProvider, useAuth } from '../../contexts/AuthContext'; 
import { MemoryRouter } from 'react-router-dom'; 

// Mock the supabase client module (still needed for AuthProvider internal workings if any)
vi.mock('../../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(), 
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

// Mock useAuth hook
const mockSignInFromAuthContext = vi.fn();
vi.mock('../../contexts/AuthContext', async () => {
  const actual = await vi.importActual('../../contexts/AuthContext');
  return {
    ...actual, // Preserve AuthProvider and other exports
    useAuth: () => ({
      // Mock all properties/methods returned by useAuth that LoginForm uses
      signIn: mockSignInFromAuthContext, 
      user: null, // Or appropriate mock user state
      loading: false, // Or appropriate mock loading state
      // Add other mocks for signOut, signUp, etc., if LoginForm uses them
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

describe('LoginForm', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockedUseNavigate.mockReset(); 
    mockSignInFromAuthContext.mockReset(); // Reset this new mock
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
    // Now mockSignInFromAuthContext is the one called by the component
    mockSignInFromAuthContext.mockResolvedValueOnce({ 
      error: {
        name: 'AuthApiError',
        message: 'Invalid login credentials', 
        status: 400,
        code: 'invalid_credentials',
      },
      // For signIn, Supabase returns user/data/error directly, not nested under user/data objects
      // So, ensure the mock matches the expected structure from your `signIn` service function
    });

    const user = userEvent.setup();
    renderWithProviders(<LoginForm />); 

    await user.type(screen.getByLabelText(/Email/i), 'user@example.com');
    await user.type(screen.getByLabelText(/Password/i), 'wrongPassword123!');
    await user.click(screen.getByRole('button', { name: /Sign In/i }));

    expect(await screen.findByText(/Invalid login credentials/i)).toBeInTheDocument(); 
    expect(mockSignInFromAuthContext).toHaveBeenCalledTimes(1);
  });

  it('should call useAuth signIn with correct credentials on successful login', async () => {
    // Mock the signIn from useAuth to simulate success
    mockSignInFromAuthContext.mockResolvedValueOnce({ 
      error: null,
      // Add user/data if your component or AuthContext expects it on successful signIn
      // user: { id: '456', email: 'test@example.com' }, 
      // data: { user: { id: '456', email: 'test@example.com' }, session: { /* mock session */ } },
    });

    const user = userEvent.setup();
    renderWithProviders(<LoginForm />); 

    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const loginButton = screen.getByRole('button', { name: /Sign In/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'CorrectPassword123!');
    await user.click(loginButton);

    expect(mockSignInFromAuthContext).toHaveBeenCalledTimes(1);
    expect(mockSignInFromAuthContext).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'CorrectPassword123!',
    });

    expect(screen.queryByText(/Invalid login credentials/i)).not.toBeInTheDocument();
    // Check for navigation after successful login because that's what LoginForm does
    expect(mockedUseNavigate).toHaveBeenCalledWith("/", { replace: true });
  });

}); 