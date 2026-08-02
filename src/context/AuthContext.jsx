import React, { createContext, useContext, useEffect, useState } from 'react';
import { AUTH_MODES } from '../utils/constants';
import { 
  supabase, 
  supabaseChangePassword,
  supabaseForgotPassword, 
  supabaseGetCurrentUser,
  supabaseLogin, 
  supabaseLogout, 
  supabaseSignup 
} from '../services/supabaseService';

const AuthContext = createContext();

/**
 * AuthProvider Component
 * 
 * Manages the global authentication state, communicating with Supabase.
 * 
 * @example
 * // Wrap your app entry point:
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState(AUTH_MODES.LOGIN);
  const [accountModalOpen, setAccountModalOpen] = useState(false);

  useEffect(() => {
    // Initial fetch
    supabaseGetCurrentUser().then(currentUser => {
      setUser(currentUser);
      setLoading(false);
    });

    // Listen to auth state changes from Supabase across tabs/refreshes
    if (supabase) {
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            name: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
            email: session.user.email
          });
        } else {
          setUser(null);
        }
      });
      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, []);

  const signup = async (name, email, password) => {
    const newUser = await supabaseSignup(name, email, password);
    setUser(newUser);
    setAuthModalOpen(false);
    return newUser;
  };

  const login = async (email, password) => {
    const loggedUser = await supabaseLogin(email, password);
    setUser(loggedUser);
    setAuthModalOpen(false);
    return loggedUser;
  };

  const logout = async () => {
    await supabaseLogout();
    setUser(null);
  };

  const forgotPassword = async (email) => {
    return await supabaseForgotPassword(email);
  };

  const changePassword = async (currentPassword, newPassword) => {
    // Supabase auth.updateUser doesn't require currentPassword if user is already logged in securely
    // But we might want to prompt them to re-auth. For now, just update.
    await supabaseChangePassword(newPassword);
    const updated = await supabaseGetCurrentUser();
    setUser({ ...updated });
    return true;
  };

  const deleteAccount = async (passwordConfirm) => {
    // Note: Supabase Edge Functions or an admin API key is typically required to permanently delete a user.
    // For now, we will sign them out. A real production app would call a secure Edge Function here.
    alert("Account deletion requires admin privileges in Supabase. Please contact support.");
    await logout();
    setAccountModalOpen(false);
    return true;
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      authModalOpen,
      setAuthModalOpen,
      authMode,
      setAuthMode,
      accountModalOpen,
      setAccountModalOpen,
      signup,
      login,
      logout,
      forgotPassword,
      changePassword,
      deleteAccount
    }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * useAuth Hook
 * 
 * Custom hook to consume the authentication context.
 * 
 * @example
 * const { user, login, logout, authModalOpen } = useAuth();
 * 
 * if (user) {
 *   return <button onClick={logout}>Sign Out</button>;
 * }
 */
export const useAuth = () => useContext(AuthContext);
