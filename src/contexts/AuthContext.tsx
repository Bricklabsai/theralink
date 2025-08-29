import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextProps {
  session: Session | null;
  user: User | null;
  profile: any | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signUp: (email: string, password: string, userData: any) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: any) => Promise<{ error: any | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      
      setProfile(data);
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('Auth state change:', event, currentSession?.user?.id);
        
        if (!isMounted) return;
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          // Only fetch profile and handle redirects for SIGNED_IN event, not token refreshes
          if (event === 'SIGNED_IN') {
            setTimeout(async () => {
              if (!isMounted) return;
              
              const profile = await fetchProfile(currentSession.user.id);
              
              // Handle dashboard redirect after successful sign in
              if (profile?.role) {
                const currentPath = window.location.pathname;
                if (currentPath.includes('/auth/login') || currentPath === '/') {
                  switch (profile.role) {
                    case 'therapist':
                      window.location.href = '/therapist/dashboard';
                      break;
                    case 'friend':
                      window.location.href = '/friend/dashboard';
                      break;
                    case 'admin':
                      window.location.href = '/admin/dashboard';
                      break;
                    default:
                      window.location.href = '/client/overview';
                      break;
                  }
                }
              }
            }, 100);
          } else if (event === 'INITIAL_SESSION') {
            // For initial session, just fetch profile without redirect
            setTimeout(async () => {
              if (!isMounted) return;
              await fetchProfile(currentSession.user.id);
            }, 0);
          }
        } else {
          setProfile(null);
        }
        
        // Only set loading to false for non-token-refresh events
        if (event !== 'TOKEN_REFRESHED') {
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (isMounted && currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
          await fetchProfile(currentSession.user.id);
        }
        
        if (isMounted) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        toast({
          title: 'Error signing in',
          description: error.message,
          variant: 'destructive',
        });
        return { error };
      }
      
      return { error: null };
    } catch (error: any) {
      toast({
        title: 'Error signing in',
        description: error.message,
        variant: 'destructive',
      });
      return { error };
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });
      
      if (error) {
        toast({
          title: 'Error signing up',
          description: error.message,
          variant: 'destructive',
        });
        return { error };
      }
      
      toast({
        title: 'Account created',
        description: 'You have successfully created an account',
      });
      
      return { error: null };
    } catch (error: any) {
      toast({
        title: 'Error signing up',
        description: error.message,
        variant: 'destructive',
      });
      return { error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (data: any) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user?.id);
      
      if (!error) {
        setProfile((prev: any) => ({ ...prev, ...data }));
        toast({
          title: 'Profile updated',
          description: 'Your profile has been updated successfully',
        });
      }
      
      return { error };
    } catch (error: any) {
      toast({
        title: 'Error updating profile',
        description: error.message,
        variant: 'destructive',
      });
      return { error };
    }
  };

  const value = {
    session,
    user,
    profile,
    isLoading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ✅ Correct: Named hook export (recommended for hooks)
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};



