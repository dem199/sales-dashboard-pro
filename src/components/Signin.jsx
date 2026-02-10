import { useActionState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Signin = () => {
  const { signInUser } = useAuth();
  const navigate = useNavigate();

  const [error, submitAction, isPending] = useActionState(
    async (previousState, formData) => {
      const email = formData.get('email');
      const password = formData.get('password');

      // Basic validation
      if (!email || !password) {
        return new Error('Please fill in all fields');
      }

      if (!email.includes('@')) {
        return new Error('Please enter a valid email address');
      }

      if (password.length < 6) {
        return new Error('Password must be at least 6 characters');
      }

      const {
        success,
        data,
        error: signInError,
      } = await signInUser(email, password);

      if (signInError) {
        // Provide user-friendly error messages
        if (signInError.includes('Invalid login credentials')) {
          return new Error('Invalid email or password');
        }
        return new Error(signInError);
      }

      if (success && data?.session) {
        navigate('/dashboard');
        return null;
      }

      return null;
    },
    null
  );

  return (
    <div className="landing-container">
      <h1 className="landing-header">Paper Like A Boss</h1>
      
      <div className="sign-form-container">
        <form
          action={submitAction}
          aria-label="Sign in form"
          aria-describedby="form-description"
        >
          <div id="form-description" className="sr-only">
            Use this form to sign in to your account. Enter your email and password.
          </div>

          <h2>Welcome back</h2>
          <p>
            Don't have an account yet?{' '}
            <Link className="form-link" to="/signup">
              Sign up
            </Link>
          </p>

          <label htmlFor="email">Email address</label>
          <input
            className="form-input"
            type="email"
            name="email"
            id="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
            aria-required="true"
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? 'signin-error' : undefined}
            disabled={isPending}
          />

          <label htmlFor="password">Password</label>
          <input
            className="form-input"
            type="password"
            name="password"
            id="password"
            placeholder="••••••••"
            autoComplete="current-password"
            required
            aria-required="true"
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? 'signin-error' : undefined}
            disabled={isPending}
          />

          <button
            type="submit"
            disabled={isPending}
            className="form-button"
            aria-busy={isPending}
          >
            {isPending ? (
              <>
                <span className="loading-spinner" aria-hidden="true"></span>
                <span style={{ marginLeft: '8px' }}>Signing in...</span>
              </>
            ) : (
              'Sign In'
            )}
          </button>

          {error && (
            <div
              id="signin-error"
              role="alert"
              className="sign-form-error-message"
            >
              {error.message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Signin;