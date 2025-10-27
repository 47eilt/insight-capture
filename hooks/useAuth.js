import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

/**
 * Custom hook for authentication and session management
 * @returns {Object} user, loading, signOut function
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkUser = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) throw error;

      if (!session) {
        router.push('/login');
        return null;
      }

      setUser(session.user);
      return session.user;
    } catch (error) {
      console.error('Error checking user session:', error);
      router.push('/login');
      return null;
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    checkUser();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
      } else {
        setUser(null);
        router.push('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [checkUser, router]);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }, [router]);

  return { user, loading, signOut, checkUser };
}
