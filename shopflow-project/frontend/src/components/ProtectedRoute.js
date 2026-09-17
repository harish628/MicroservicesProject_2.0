// src/components/ProtectedRoute.js
//
// What this file does:
// Wraps any page that requires login. If not logged in, redirects to /login.
//
// Feynman version:
// Like a movie theater usher checking tickets before letting you into the hall.
// No ticket (not logged in)? You get redirected to the box office (login page)
// instead of being let into the movie.

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  // While we're still checking localStorage on app startup, show nothing
  // (prevents a flash redirect to login before we even know if user is logged in)
  if (loading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
