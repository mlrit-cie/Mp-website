import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User, UserRole } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role?: UserRole) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, password: string, role?: UserRole) => Promise<{ success: boolean; message?: string }>;
  loginWithGoogle: () => Promise<void>;
  completeGoogleLogin: () => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => void;
  updateProfile: (updates: Partial<Pick<User, 'name' | 'email' | 'phone' | 'githubLink' | 'linkedinLink'>>) => Promise<void>;
}

const ALLOWED_EMAIL_DOMAIN = 'mlrit.ac.in';

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};

const getRoleFromEmail = (email: string): UserRole => {
  if (email.includes('admin')) return 'admin';
  if (email.includes('faculty')) return 'faculty';
  if (email.includes('mentor')) return 'student_mentor';
  return 'student';
};

const dbRowToUser = (row: any): User => ({
  id: String(row.id),
  name: row.name,
  email: row.email,
  role: row.role as UserRole,
  approved: row.approved ?? false,
  department: row.department || undefined,
  rollNumber: row.roll_number || undefined,
  phone: row.phone || undefined,
  githubLink: row.github_link || undefined,
  linkedinLink: row.linkedin_link || undefined,
});

const PROFILE_COLUMNS = 'id, name, email, role, approved, department, roll_number, phone, github_link, linkedin_link';

/**
 * Look up the public.users profile row for the current authenticated session.
 * Prefers a match on auth_id; falls back to email match for pre-bridge profiles
 * (one-time link-up). Creates a fresh profile row if none exists.
 */
const loadOrCreateProfile = async (
  authId: string,
  email: string,
  fallbackName: string,
  fallbackRole: UserRole,
): Promise<User | null> => {
  const normalisedEmail = email.trim().toLowerCase();

  // 1. Match by auth_id (steady-state path)
  const byAuth = await supabase
    .from('users').select(PROFILE_COLUMNS).eq('auth_id', authId).maybeSingle();
  if (byAuth.data) return dbRowToUser(byAuth.data);

  // 2. Match by email (one-time link-up of a pre-bridge profile)
  const byEmail = await supabase
    .from('users').select(PROFILE_COLUMNS).eq('email', normalisedEmail).maybeSingle();
  if (byEmail.data) {
    const linked = await supabase
      .from('users').update({ auth_id: authId }).eq('id', byEmail.data.id)
      .select(PROFILE_COLUMNS).single();
    return linked.data ? dbRowToUser(linked.data) : dbRowToUser(byEmail.data);
  }

  // 3. Brand-new user — insert a profile
  const created = await supabase
    .from('users')
    .insert([{ name: fallbackName, email: normalisedEmail, role: fallbackRole, auth_id: authId }])
    .select(PROFILE_COLUMNS).single();
  return created.data ? dbRowToUser(created.data) : null;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  const persist = (u: User | null) => {
    setUser(u);
    if (u) localStorage.setItem('user', JSON.stringify(u));
    else localStorage.removeItem('user');
  };

  // Keep the in-memory user in sync with Supabase Auth session changes
  // (handles tab refocus, token refresh, sign-out from another tab).
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        persist(null);
        return;
      }
      if (event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
        // Don't disturb cached profile on routine refreshes
        return;
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  /* ── Login (email + password via Supabase Auth) ── */
  const login = async (email: string, password: string, role?: UserRole): Promise<{ success: boolean; message?: string }> => {
    try {
      // MOCK LOGIN - Remove this when Supabase is connected
      const normalizedEmail = email.trim().toLowerCase();
      const mockUser: User = {
        id: '1',
        name: normalizedEmail.split('@')[0],
        email: normalizedEmail,
        role: role || getRoleFromEmail(normalizedEmail),
        approved: true,
      };
      persist(mockUser);
      return { success: true };
      
      /* Uncomment when Supabase is ready:
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error || !data.session) {
        return { success: false, message: error?.message || 'Invalid credentials.' };
      }

      const authUser = data.session.user;
      const profile = await loadOrCreateProfile(
        authUser.id,
        authUser.email!,
        authUser.user_metadata?.full_name || authUser.email!.split('@')[0],
        getRoleFromEmail(authUser.email!),
      );
      if (!profile) return { success: false, message: 'Could not load user profile.' };
      persist(profile);
      return { success: true };
      */
    } catch (err: any) {
      console.error('login error:', err);
      return { success: false, message: err?.message || 'Login failed.' };
    }
  };

  /* ── Register (Supabase Auth signUp) ── */
  const register = async (
    name: string, email: string, password: string, role?: UserRole
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const normalised = email.trim().toLowerCase();
      const userRole = role || getRoleFromEmail(normalised);

      const { data, error } = await supabase.auth.signUp({
        email: normalised,
        password,
        options: { data: { full_name: name.trim() } },
      });
      if (error) return { success: false, message: error.message };
      if (!data.user) return { success: false, message: 'Registration failed.' };

      // If email-confirmation is on, signUp returns user but no session — the
      // client is still anon, and the users_select_authenticated RLS policy
      // would block our profile lookup. The Postgres trigger `handle_new_auth_user`
      // has already created the profile row server-side, so we don't need to
      // touch it from the client. Just tell the user to confirm.
      if (!data.session) {
        return {
          success: true,
          message: 'Account created. Check your email to confirm before signing in.',
        };
      }

      // Session is live — safe to load/link the profile.
      const profile = await loadOrCreateProfile(data.user.id, normalised, name.trim(), userRole);
      if (!profile) return { success: false, message: 'Could not create user profile.' };
      persist(profile);
      return { success: true };
    } catch (err: any) {
      console.error('register error:', err);
      return { success: false, message: err?.message || 'Registration failed.' };
    }
  };

  /* ── Google OAuth: redirect to Google ── */
  const loginWithGoogle = async (): Promise<void> => {
    // MOCK GOOGLE LOGIN - Remove this when Supabase is connected
    const mockUser: User = {
      id: '1',
      name: 'Demo User',
      email: 'demo@mlrit.ac.in',
      role: 'student',
      approved: true,
    };
    persist(mockUser);
    
    /* Uncomment when Supabase is ready:
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { hd: ALLOWED_EMAIL_DOMAIN, prompt: 'select_account' },
      },
    });
    */
  };

  /* ── Google OAuth: handle callback after redirect ── */
  const completeGoogleLogin = async (): Promise<{ success: boolean; message?: string }> => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session?.user?.email) {
        return { success: false, message: 'Could not complete Google sign-in.' };
      }

      const email = session.user.email.trim().toLowerCase();
      if (!email.endsWith(`@${ALLOWED_EMAIL_DOMAIN}`)) {
        await supabase.auth.signOut();
        return { success: false, message: `Only @${ALLOWED_EMAIL_DOMAIN} accounts are allowed.` };
      }

      const fallbackName = (session.user.user_metadata?.full_name as string)
        || (session.user.user_metadata?.name as string)
        || email.split('@')[0];
      const profile = await loadOrCreateProfile(
        session.user.id, email, fallbackName, getRoleFromEmail(email),
      );
      if (!profile) return { success: false, message: 'Could not load user profile.' };
      persist(profile);
      return { success: true };
    } catch (err: any) {
      console.error('completeGoogleLogin error:', err);
      return { success: false, message: err?.message || 'Google sign-in failed.' };
    }
  };

  /* ── Logout ── */
  const logout = async () => {
    await supabase.auth.signOut().catch(() => {});
    persist(null);
  };

  /* ── Switch role (demo only) ── */
  const switchRole = (role: UserRole) => {
    if (user) persist({ ...user, role });
  };

  /* ── Update profile ── */
  const updateProfile = async (
    updates: Partial<Pick<User, 'name' | 'email' | 'phone' | 'githubLink' | 'linkedinLink'>>
  ) => {
    if (!user) return;
    const dbUpdates: Record<string, any> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.githubLink !== undefined) dbUpdates.github_link = updates.githubLink;
    if (updates.linkedinLink !== undefined) dbUpdates.linkedin_link = updates.linkedinLink;

    await supabase.from('users').update(dbUpdates).eq('id', Number(user.id));
    persist({ ...user, ...updates });
  };

  return (
    <AuthContext.Provider value={{ user, login, register, loginWithGoogle, completeGoogleLogin, logout, switchRole, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
