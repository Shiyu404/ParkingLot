import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Display loading spinner while auth state is being determined
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login');
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user && !allowedRoles.includes(user.role)) {
    console.log(`User role ${user.role} not in allowed roles: [${allowedRoles.join(', ')}]`);
    // Redirect to dashboard or home page if not authorized
    return <Navigate to="/" replace />;
  }

  console.log('User authenticated and authorized:', user.role);
  return <>{children}</>;
};

export default ProtectedRoute;
