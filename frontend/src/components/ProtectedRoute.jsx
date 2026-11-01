import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ allowedRoles, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="max-w-[1360px] mx-auto px-6 py-24">
        <p className="text-base text-muted">Verifying session...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const fallbackMap = {
      STUDENT: '/dashboard/student',
      CLUB_MANAGER: '/dashboard/manager',
      ADMIN: '/dashboard/admin',
    };
    return <Navigate to={fallbackMap[user.role] || '/'} replace />;
  }

  return children;
}
