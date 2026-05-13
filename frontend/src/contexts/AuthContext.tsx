import React, { createContext, useContext, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User, UserRole } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role?: UserRole) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  updateProfile: (updates: Partial<Pick<User, 'name' | 'email' | 'phone' | 'githubLink' | 'linkedinLink'>>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};

const hashPassword = async (password: string): Promise<string> => {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
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
  department: row.department || undefined,
  rollNumber: row.roll_number || undefined,
  phone: row.phone || undefined,
  githubLink: row.github_link || undefined,
  linkedinLink: row.linkedin_link || undefined,
});

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

  /* ── Login ── */
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const hashedPw = await hashPassword(password);

      const { data: row, error } = await supabase
        .from('users')
        .select('id, name, email, role, department, roll_number, phone, github_link, linkedin_link, password')
        .eq('email', email.trim().toLowerCase())
        .single();

      if (error || !row) return false;

      // Accept SHA-256 hash match
      if (row.password !== hashedPw) return false;

      persist(dbRowToUser(row));
      return true;
    } catch (err) {
      console.error('login error:', err);
      return false;
    }
  };

  /* ── Register ── */
  const register = async (
    name: string, email: string, password: string, role?: UserRole
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const userRole = role || getRoleFromEmail(email);
      const hashedPw = await hashPassword(password);

      // Check duplicate
      const { data: existing } = await supabase
        .from('users').select('id').eq('email', email.trim().toLowerCase()).maybeSingle();
      if (existing) return { success: false, message: 'An account with this email already exists.' };

      const { data: newRow, error } = await supabase
        .from('users')
        .insert([{ name: name.trim(), email: email.trim().toLowerCase(), password: hashedPw, role: userRole }])
        .select('id, name, email, role, department, roll_number, phone, github_link, linkedin_link')
        .single();

      if (error || !newRow) return { success: false, message: error?.message || 'Registration failed.' };

      persist(dbRowToUser(newRow));
      return { success: true };
    } catch (err: any) {
      console.error('register error:', err);
      return { success: false, message: err.message || 'Registration failed.' };
    }
  };

  /* ── Logout ── */
  const logout = () => persist(null);

  /* ── Switch role (demo only) ── */
  const switchRole = (role: UserRole) => {
    if (user) persist({ ...user, role });
  };

  /* ── Update profile — saves to Supabase + localStorage ── */
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
    <AuthContext.Provider value={{ user, login, register, logout, switchRole, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
