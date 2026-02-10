import { createContext, useState, useContext, useEffect } from 'react';
import supabase from '../supabase-client';

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [session, setSession] = useState(undefined);
  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  useEffect(() => {
    async function getInitialSession() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          throw error;
        }
        setSession(data.session);
      } catch (error) {
        console.error('Error getting session:', error.message);
        setSession(null);
      }
    }

    getInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      console.log('Session changed:', session ? 'Authenticated' : 'Signed out');
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session) {
      setUsers([]);
      return;
    }

    async function fetchUsers() {
      try {
        setIsLoadingUsers(true);
        const { data, error } = await supabase
          .from('user_profiles')
          .select('id, name, account_type')
          .order('name', { ascending: true });

        if (error) {
          throw error;
        }

        console.log('Fetched users:', data?.length || 0, 'users');
        setUsers(data || []);
      } catch (error) {
        console.error('Error fetching users:', error.message);
        setUsers([]);
      } finally {
        setIsLoadingUsers(false);
      }
    }

    fetchUsers();

    // Set up real-time subscription for user profile changes
    const channel = supabase
      .channel('user-profile-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_profiles',
        },
        () => {
          console.log('User profiles updated, refetching...');
          fetchUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  const signInUser = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password: password,
      });

      if (error) {
        console.error('Supabase sign-in error:', error.message);
        return { success: false, error: error.message };
      }

      console.log('Sign-in successful');
      return { success: true, data };
    } catch (error) {
      console.error('Unexpected error during sign-in:', error.message);
      return {
        success: false,
        error: 'An unexpected error occurred. Please try again.',
      };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Supabase sign-out error:', error.message);
        return { success: false, error: error.message };
      }

      console.log('Sign-out successful');
      return { success: true };
    } catch (error) {
      console.error('Unexpected error during sign-out:', error.message);
      return {
        success: false,
        error: 'An unexpected error occurred during sign out.',
      };
    }
  };

  const signUpNewUser = async (email, password, name, accountType) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password: password,
        options: {
          data: {
            name: name.trim(),
            account_type: accountType,
          },
        },
      });

      if (error) {
        console.error('Supabase sign-up error:', error.message);
        return { success: false, error: error.message };
      }

      console.log('Sign-up successful');
      return { success: true, data };
    } catch (error) {
      console.error('Unexpected error during sign-up:', error.message);
      return {
        success: false,
        error: 'An unexpected error occurred. Please try again.',
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        signInUser,
        signOut,
        signUpNewUser,
        users,
        isLoadingUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthContextProvider');
  }
  return context;
};