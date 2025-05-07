import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, signUp as supabaseSignUp, signIn as supabaseSignIn, signOut as supabaseSignOut, resetPassword as supabaseResetPassword } from '../services/auth';

// Define the shape of the context
interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: Error | null;
  signUp: typeof supabaseSignUp;
  signIn: typeof supabaseSignIn;
  signOut: typeof supabaseSignOut;
  resetPassword: typeof supabaseResetPassword;
  // You might want to add more specific types for signUp/signIn args if not using 'any' in auth.ts
}

// Create the context with a default undefined value, error if used without Provider
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the AuthProvider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null); // Store auth operation errors

  useEffect(() => {
    setIsLoading(true);
    // Check for an existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
        // console.log('Auth event:', event, session);
        // Handle specific events if needed, e.g., navigating on SIGNED_OUT
      }
    );

    // Cleanup listener on unmount
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Wrap auth functions to include loading and error handling if desired
  // For simplicity, directly exposing the service functions here.
  // You could enhance them to set local loading/error states for individual operations.

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    error,
    signUp: supabaseSignUp,
    signIn: supabaseSignIn,
    signOut: async () => {
        // Context's isLoading and error are for the overall session state,
        // not necessarily for individual operations like signOut if forms handle their own isSubmitting.
        // However, you could set context isLoading true here if you want a global spinner for this.
        const { error: signOutError } = await supabaseSignOut();
        if (signOutError) {
            console.error('SignOut Error (AuthContext):', signOutError);
            // setError(signOutError); // Optionally update context error
        }
        // User/session update is handled by onAuthStateChange
        return { error: signOutError };
    },
    resetPassword: async (email: string) => {
        // Let the component calling this manage its own loading/error/success UI states
        // based on the promise returned by this function.
        const { data, error: resetError } = await supabaseResetPassword(email);
        if (resetError) {
            console.error('Reset Password Error (AuthContext/Service Call):', resetError);
        }
        return { data, error: resetError }; 
    }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Create a custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 