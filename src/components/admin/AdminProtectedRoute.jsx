import { useAdminAuth } from '@/lib/AdminAuthContext';
import { Navigate } from 'react-router-dom';

export default function AdminProtectedRoute({ children }) {
  const { admin, isLoading, error } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !admin) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}