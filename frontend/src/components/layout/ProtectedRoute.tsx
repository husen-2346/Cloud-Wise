import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../brand/Logo';
import { Spinner } from '../ui/Spinner';

interface ProtectedRouteProps {
  redirectIfAuthenticated?: boolean;
}

export function ProtectedRoute({
  redirectIfAuthenticated = false,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  // Show branded loading screen while verifying session
  if (isLoading) {
    return (
      <div className="min-h-screen bg-app flex flex-col items-center justify-center p-6">
        <Logo size="lg" className="mb-6 animate-pulse" />
        <div className="flex items-center gap-3 text-muted text-sm font-medium">
          <Spinner size="sm" />
          <span>Validating session...</span>
        </div>
      </div>
    );
  }

  // If page is for unauthenticated only (e.g. /login, /register)
  if (redirectIfAuthenticated) {
    if (isAuthenticated) {
      return <Navigate to="/app/overview" replace />;
    }
    return <Outlet />;
  }

  // If page is protected and user is not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
