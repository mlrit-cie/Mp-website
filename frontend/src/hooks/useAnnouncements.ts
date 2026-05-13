import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

const QUERY_KEY = ['announcements'] as const;

export const useAnnouncements = () => {
  const { user } = useAuth();
  const qc = useQueryClient();

  const queryKey = [...QUERY_KEY, user?.role ?? 'anon'];

  const query = useQuery({
    queryKey,
    enabled: !!user,
    queryFn: async (): Promise<Announcement[]> => {
      let q = supabase
        .from('announcements')
        .select('id, title, content, target_audience, created_at, users!inner(name)')
        .order('created_at', { ascending: false });
      // Students only see 'all' announcements
      if (user?.role === 'student') q = q.eq('target_audience', 'all');
      const { data, error } = await q;
      if (error) throw error;
      return (data || []).map((a: any) => ({
        id: a.id,
        title: a.title,
        content: a.content,
        author: a.users?.name || 'Unknown',
        target_audience: a.target_audience,
        created_at: a.created_at,
      }));
    },
  });

  const create = useMutation({
    mutationFn: async (payload: {
      title: string; content: string; target_audience: 'all' | 'mentors_only';
    }) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('announcements').insert([{
        title: payload.title,
        content: payload.content,
        target_audience: payload.target_audience,
        author_id: Number(user.id),
      }]);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const remove = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('announcements').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  return {
    announcements: query.data ?? [],
    loading: query.isLoading,
    error: query.error ? 'Could not load announcements. Please try again.' : null,
    fetchAnnouncements: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
    createAnnouncement: async (payload: { title: string; content: string; target_audience: 'all' | 'mentors_only' }) => {
      try { await create.mutateAsync(payload); return true; }
      catch (err) { console.error('createAnnouncement error:', err); return false; }
    },
    deleteAnnouncement: async (id: number) => {
      try { await remove.mutateAsync(id); return true; }
      catch (err) { console.error('deleteAnnouncement error:', err); return false; }
    },
  };
};
