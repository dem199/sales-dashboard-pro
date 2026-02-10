import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RootRedirect = () => {
  const { session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (session === undefined) {
      // Still loading, wait
      return;
    }

    if (session) {
      // User is authenticated, redirect to dashboard
      navigate('/dashboard', { replace: true });
    } else {
      // User is not authenticated, redirect to signin
      navigate('/signin', { replace: true });
    }
  }, [session, navigate]);

  return (
    <div className="loading-container" role="status" aria-live="polite">
      <div>
        <div className="loading-spinner" style={{ width: '32px', height: '32px', borderWidth: '3px' }}></div>
        <p style={{ marginTop: '16px' }}>Loading...</p>
      </div>
    </div>
  );
};

export default RootRedirect;