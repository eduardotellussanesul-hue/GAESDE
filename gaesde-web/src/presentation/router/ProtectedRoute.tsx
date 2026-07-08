import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function ProtectedRoute({ adminOnly = false }: { adminOnly?: boolean }) {
  const { session, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return <div className="page page--center">Carregando sessao...</div>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !session.isAdmin && !session.isInstructor) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
