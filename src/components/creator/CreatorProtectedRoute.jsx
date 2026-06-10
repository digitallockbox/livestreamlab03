import { useCreatorAuth } from '@/lib/CreatorAuthContext';
import { Navigate } from 'react-router-dom';

export default function CreatorProtectedRoute({ children }) {
  const { creator, isLoading, error } = useCreatorAuth();

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !creator) {
    return <Navigate to="/creator/login" replace />;
  }

  return children;
}