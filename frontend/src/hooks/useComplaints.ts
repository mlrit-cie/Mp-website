import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Student complaint box.
 *
 * Backed by localStorage for now (there's no backend connected yet), so a
 * complaint a student submits is visible to the mentor and admin dashboards in
 * the same browser, and survives reloads. When the real API lands, only this
 * hook's body changes (POST/GET /complaints) — the components stay the same.
 */
export interface Complaint {
  id: string;
  authorName: string;
  authorRole: string;
  subject: string;
  message: string;
  createdAt: string;
  status: 'open' | 'resolved';
}

const STORAGE_KEY = 'ps_complaints';
const UPDATED_EVENT = 'complaints:updated';

function read(): Complaint[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Complaint[]) : [];
  } catch {
    return [];
  }
}

function write(list: Complaint[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  // Notify listeners in this tab (the native `storage` event only fires in OTHER tabs).
  window.dispatchEvent(new Event(UPDATED_EVENT));
}

function newId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

export function useComplaints() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>(read);

  // Keep every mounted panel in sync (same tab via custom event, other tabs via storage).
  useEffect(() => {
    const refresh = () => setComplaints(read());
    window.addEventListener('storage', refresh);
    window.addEventListener(UPDATED_EVENT, refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener(UPDATED_EVENT, refresh);
    };
  }, []);

  const submitComplaint = useCallback(
    (input: { subject: string; message: string }) => {
      const complaint: Complaint = {
        id: newId(),
        authorName: user?.name ?? 'Unknown',
        authorRole: user?.role ?? 'student',
        subject: input.subject.trim(),
        message: input.message.trim(),
        createdAt: new Date().toISOString(),
        status: 'open',
      };
      write([complaint, ...read()]); // newest first
    },
    [user]
  );

  const resolveComplaint = useCallback((id: string) => {
    write(read().map((c) => (c.id === id ? { ...c, status: 'resolved' } : c)));
  }, []);

  return {
    complaints,
    openCount: complaints.filter((c) => c.status === 'open').length,
    submitComplaint,
    resolveComplaint,
  };
}
