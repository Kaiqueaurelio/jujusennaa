import { useState, useEffect, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const initRef = useRef(false);

  const checkAdminRole = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();

      setIsAdmin(!!data && !error);
    } catch (err) {
      console.error('Error checking admin role:', err);
      setIsAdmin(false);
    }
  }, []);

  useEffect(() => {
    // Prevent double initialization
    if (initRef.current) return;
    initRef.current = true;

    let isMounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        if (!isMounted) return;
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Check admin role after auth change
        if (currentSession?.user) {
          setTimeout(() => {
            if (isMounted) {
              checkAdminRole(currentSession.user.id);
            }
          }, 0);
        } else {
          setIsAdmin(false);
        }
        
        // Always set loading to false on auth state change
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session: existingSession }, error }) => {
      if (!isMounted) return;
      
      if (error) {
        console.error('Error getting session:', error);
        setLoading(false);
        return;
      }
      
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      
      if (existingSession?.user) {
        checkAdminRole(existingSession.user.id);
      }
      
      // Set loading false after session check
      setLoading(false);
    }).catch((err) => {
      if (!isMounted) return;
      console.error('Error getting session:', err);
      setLoading(false);
    });

    // Failsafe timeout - shorter and more reliable
    const timeout = setTimeout(() => {
      if (isMounted) {
        setLoading(false);
      }
    }, 3000);

    return () => {
      isMounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [checkAdminRole]);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });
      return { data, error };
    } catch (err) {
      return { data: null, error: err as Error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (!error) {
        setUser(null);
        setSession(null);
        setIsAdmin(false);
      }
      return { error };
    } catch (err) {
      return { error: err as Error };
    }
  };

  return {
    user,
    session,
    loading,
    isAdmin,
    signIn,
    signUp,
    signOut,
    checkAdminRole,
  };
}
