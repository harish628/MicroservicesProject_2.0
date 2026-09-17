// src/context/AuthContext.js
//
// What this file does:
// Manages the logged-in user's state GLOBALLY — accessible from any component
// without passing props down manually through every level.
//
// Feynman version:
// Imagine a school where every classroom needs to know who the principal is.
// Without Context, you'd have to pass a note from the office, to the hallway
// monitor, to each teacher, to each student — painful and error-prone.
// With Context, there's a loudspeaker system — any classroom can just "tune in"
// and instantly know the answer. React Context IS that loudspeaker system.
//
// Here, ANY component in our app can ask "who is logged in?" using useAuth()
// without us manually passing the user object through 10 layers of components.

import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // On app startup, check if we have a saved token + user in localStorage
  // Feynman: like checking your pocket for your ID badge when you walk into
  // the office in the morning — if you have one from yesterday, you're still
  // recognized without re-registering.
  useEffect(() => {
    const savedUser  = localStorage.getItem('shopflow_user');
    const savedToken = localStorage.getItem('shopflow_token');

    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // login() saves the token + user, used right after a successful API call
  const login = (token, userData) => {
    localStorage.setItem('shopflow_token', token);
    localStorage.setItem('shopflow_user', JSON.stringify(userData));
    setUser(userData);
  };

  // logout() clears everything — token, user, and any cached cart
  const logout = () => {
    localStorage.removeItem('shopflow_token');
    localStorage.removeItem('shopflow_user');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook — lets any component do: const { user, login, logout } = useAuth();
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
