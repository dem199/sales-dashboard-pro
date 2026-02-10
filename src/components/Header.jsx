import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Header() {
  const { signOut, session, users } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const currentUser = users.find((user) => user.id === session?.user?.id);

  const handleSignOut = async (e) => {
    e.preventDefault();
    setError(null);

    const { success, error: signOutError } = await signOut();
    if (success) {
      navigate('/signin');
    } else {
      setError(signOutError);
    }
  };

  const accountTypeMap = {
    rep: 'Sales Rep',
    admin: 'Admin',
  };

  const displayAccountType = currentUser?.account_type
    ? accountTypeMap[currentUser.account_type]
    : '';

  return (
    <header role="banner" aria-label="Dashboard header">
      <div className="header-content" role="navigation" aria-label="User account navigation">
        <div className="header-user-info">
          <h2>
            <span className="sr-only">Logged in as:</span>
            {currentUser?.name}
          </h2>
          {displayAccountType && (
            <span className="account-badge">{displayAccountType}</span>
          )}
        </div>

        <div className="header-actions">
          <button
            onClick={toggleTheme}
            className="theme-toggle-btn"
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          >
            {isDark ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>

          <button
            onClick={handleSignOut}
            className="sign-out-btn"
            aria-label="Sign out of your account"
          >
            Sign out
          </button>
        </div>
      </div>

      <h1>
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          role="img"
          aria-label="Dashboard icon"
        >
          <path
            d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
        <span>Sales Team Dashboard</span>
      </h1>

      {error && (
        <div role="alert" className="header-error" id="signout-error">
          {error}
        </div>
      )}
    </header>
  );
}

export default Header;