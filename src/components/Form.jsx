import { useActionState } from 'react';
import supabase from '../supabase-client';
import { useAuth } from '../context/AuthContext';

function Form() {
  const { users, session } = useAuth();

  const [error, submitAction, isPending] = useActionState(
    async (previousState, formData) => {
      const submittedName = formData.get('name');
      const submittedValue = formData.get('value');

      // Validation
      if (!submittedName || submittedName.trim() === '') {
        return new Error('Please select a sales representative');
      }

      if (!submittedValue || parseFloat(submittedValue) <= 0) {
        return new Error('Please enter a valid deal amount greater than $0');
      }

      const user = users.find((u) => u.name === submittedName);

      if (!user) {
        return new Error('Invalid user selected');
      }

      const newDeal = {
        user_id: user.id,
        value: parseFloat(submittedValue),
      };

      const { error: insertError } = await supabase
        .from('sales_deals')
        .insert(newDeal);

      if (insertError) {
        console.error('Error adding deal:', insertError.message);
        return new Error('Failed to add deal. Please try again.');
      }

      // Success - form will reset automatically
      return null;
    },
    null
  );

  const currentUser = users.find((u) => u.id === session?.user?.id);
  const isRep = currentUser?.account_type === 'rep';

  const generateOptions = () => {
    const reps = users.filter((user) => user.account_type === 'rep');
    
    if (reps.length === 0) {
      return <option value="">No sales reps available</option>;
    }

    return reps.map((user) => (
      <option key={user.id} value={user.name}>
        {user.name}
      </option>
    ));
  };

  // Don't render if users haven't loaded yet
  if (users.length === 0) {
    return (
      <div className="add-form-container">
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          Loading form...
        </p>
      </div>
    );
  }

  return (
    <div className="add-form-container">
      <form
        action={submitAction}
        aria-label="Add new sales deal"
        aria-describedby="form-description"
      >
        <div id="form-description" className="sr-only">
          Use this form to add a new sales deal. {isRep ? 'Enter the deal amount.' : 'Select a sales rep and enter the deal amount.'}
        </div>

        <div className="form-field">
          <label htmlFor="deal-name">Sales Representative</label>
          {isRep ? (
            <input
              id="deal-name"
              type="text"
              name="name"
              value={currentUser?.name || ''}
              readOnly
              className="rep-name-input"
              aria-label="Sales representative name"
              aria-readonly="true"
            />
          ) : (
            <select
              id="deal-name"
              name="name"
              defaultValue={users.find(u => u.account_type === 'rep')?.name || ''}
              aria-required="true"
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? 'form-error' : undefined}
              disabled={isPending}
            >
              {generateOptions()}
            </select>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="deal-value">Deal Amount (USD)</label>
          <input
            id="deal-value"
            type="number"
            name="value"
            defaultValue=""
            placeholder="0"
            className="amount-input"
            min="0"
            step="100"
            aria-required="true"
            aria-invalid={error ? 'true' : 'false'}
            aria-label="Deal amount in dollars"
            aria-describedby={error ? 'form-error' : undefined}
            disabled={isPending}
          />
        </div>

        <div className="form-button-wrapper">
          <button
            type="submit"
            disabled={isPending}
            aria-busy={isPending}
          >
            {isPending ? (
              <>
                <span className="loading-spinner" aria-hidden="true"></span>
                <span style={{ marginLeft: '8px' }}>Adding...</span>
              </>
            ) : (
              'Add Deal'
            )}
          </button>
        </div>
      </form>

      {error && (
        <div id="form-error" role="alert" className="error-message">
          {error.message}
        </div>
      )}
    </div>
  );
}

export default Form;