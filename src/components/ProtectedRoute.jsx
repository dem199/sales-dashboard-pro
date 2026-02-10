import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const { session } = useAuth();

  // Show loading state while checking authentication
  if (session === undefined) {
    return (
      <div className="loading-container" role="status" aria-live="polite">
        <div>
          <div className="loading-spinner" style={{ width: '32px', height: '32px', borderWidth: '3px' }}></div>
          <p style={{ marginTop: '16px' }}>Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to signin if not authenticated
  if (!session) {
    return <Navigate to="/signin" replace />;
  }

  // Render protected content
  return <>{children}</>;
};

export default ProtectedRoute;