import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

type ProtectedRouteProps = {
  adminOnly?: boolean;
  allowInstructor?: boolean;
};

export function ProtectedRoute({ adminOnly = false, allowInstructor = true }: ProtectedRouteProps) {
  const { session, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return <div className="page page--center">Carregando sessao...</div>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly) {
    const hasAccess = session.isAdmin || (allowInstructor && session.isInstructor);
    if (!hasAccess) {
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
}
