import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useActionState } from 'react';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const { signUpNewUser } = useAuth();
  const navigate = useNavigate();

  const [error, submitAction, isPending] = useActionState(
    async (previousState, formData) => {
      const email = formData.get('email');
      const password = formData.get('password');
      const name = formData.get('name');
      const accountType = formData.get('account-type');

      // Validation
      if (!name || name.trim().length < 2) {
        return new Error('Please enter a valid name (at least 2 characters)');
      }

      if (!email || !email.includes('@')) {
        return new Error('Please enter a valid email address');
      }

      if (!password || password.length < 6) {
        return new Error('Password must be at least 6 characters');
      }

      if (!accountType) {
        return new Error('Please select your role');
      }

      const {
        success,
        data,
        error: signUpError,
      } = await signUpNewUser(email, password, name, accountType);

      if (signUpError) {
        // Provide user-friendly error messages
        if (signUpError.includes('already registered')) {
          return new Error('This email is already registered. Please sign in instead.');
        }
        return new Error(signUpError);
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
          aria-label="Sign up form"
          aria-describedby="form-description"
        >
          <div id="form-description" className="sr-only">
            Use this form to create a new account. Enter your name, email, password, and select your role.
          </div>

          <h2>Create your account</h2>
          <p>
            Already have an account?{' '}
            <Link className="form-link" to="/signin">
              Sign in
            </Link>
          </p>

          <label htmlFor="name">Full name</label>
          <input
            className="form-input"
            type="text"
            name="name"
            id="name"
            placeholder="John Doe"
            autoComplete="name"
            required
            aria-required="true"
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? 'signup-error' : undefined}
            disabled={isPending}
          />

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
            aria-describedby={error ? 'signup-error' : undefined}
            disabled={isPending}
          />

          <label htmlFor="password">Password</label>
          <input
            className="form-input"
            type="password"
            name="password"
            id="password"
            placeholder="••••••••"
            autoComplete="new-password"
            required
            aria-required="true"
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? 'signup-error' : undefined}
            disabled={isPending}
          />

          <fieldset
            className="form-fieldset"
            aria-required="true"
            disabled={isPending}
          >
            <legend>Select your role</legend>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  name="account-type"
                  value="admin"
                  required
                  aria-required="true"
                />
                Admin
              </label>
              <label>
                <input
                  type="radio"
                  name="account-type"
                  value="rep"
                  required
                  aria-required="true"
                />
                Sales Rep
              </label>
            </div>
          </fieldset>

          <button
            type="submit"
            className="form-button"
            disabled={isPending}
            aria-busy={isPending}
          >
            {isPending ? (
              <>
                <span className="loading-spinner" aria-hidden="true"></span>
                <span style={{ marginLeft: '8px' }}>Creating account...</span>
              </>
            ) : (
              'Create Account'
            )}
          </button>

          {error && (
            <div
              id="signup-error"
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

export default Signup;