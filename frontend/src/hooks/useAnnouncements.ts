import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export interface Announcement {
  id: number;
  title: string;
  content: string;
  author: string;
  target_audience: 'all' | 'mentors_only';
  created_at: string;
}

export const useAnnouncements = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('announcements')
        .select('id, title, content, target_audience, created_at, users!inner(name)')
        .order('created_at', { ascending: false });

      // Students only see 'all' announcements
      if (user?.role === 'student') {
        query = query.eq('target_audience', 'all');
      }

      const { data, error: err } = await query;
      if (err) throw err;

      setAnnouncements(
        (data || []).map((a: any) => ({
          id: a.id,
          title: a.title,
          content: a.content,
          author: a.users?.name || 'Unknown',
          target_audience: a.target_audience,
          created_at: a.created_at,
        }))
      );
    } catch (err) {
      setError('Could not load announcements. Please try again.');
      console.error('fetchAnnouncements error:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createAnnouncement = async (payload: {
    title: string;
    content: string;
    target_audience: 'all' | 'mentors_only';
  }) => {
    if (!user) return false;
    try {
      const { error } = await supabase.from('announcements').insert([{
        title: payload.title,
        content: payload.content,
        target_audience: payload.target_audience,
        author_id: Number(user.id),
      }]);
      if (error) throw error;
      await fetchAnnouncements();
      return true;
    } catch (err) {
      console.error('createAnnouncement error:', err);
      return false;
    }
  };

  const deleteAnnouncement = async (id: number) => {
    try {
      const { error } = await supabase.from('announcements').delete().eq('id', id);
      if (error) throw error;
      await fetchAnnouncements();
      return true;
    } catch (err) {
      console.error('deleteAnnouncement error:', err);
      return false;
    }
  };

  useEffect(() => {
    if (user) fetchAnnouncements();
  }, [user, fetchAnnouncements]);

  return { announcements, loading, error, fetchAnnouncements, createAnnouncement, deleteAnnouncement };
};
