import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export type NotificationType =
  | 'announcement'
  | 'project_status'
  | 'project_feedback'
  | 'team_assignment'
  | 'mentor_assignment'
  | 'deadline';

export interface Notification {
  id: number;
  user_id: number;
  type: NotificationType;
  title: string;
  message: string;
  link: string | null;
  read_at: string | null;
  created_at: string;
}

const PAGE_SIZE = 30;

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const refetch = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', Number(user.id))
      .order('created_at', { ascending: false })
      .limit(PAGE_SIZE);
    setNotifications((data || []) as Notification[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!user) { setNotifications([]); return; }
    refetch();

    // Realtime: push-update the list whenever the user's own notifications change.
    const channel = supabase
      .channel(`notifications-user-${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setNotifications((prev) => [payload.new as Notification, ...prev].slice(0, PAGE_SIZE));
          } else if (payload.eventType === 'UPDATE') {
            setNotifications((prev) =>
              prev.map((n) => (n.id === (payload.new as Notification).id ? (payload.new as Notification) : n))
            );
          } else if (payload.eventType === 'DELETE') {
            setNotifications((prev) => prev.filter((n) => n.id !== (payload.old as Notification).id));
          }
        }
      )
      .subscribe();

    return () => { void supabase.removeChannel(channel); };
  }, [user, refetch]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => n.read_at === null).length,
    [notifications]
  );

  const markAsRead = useCallback(async (id: number) => {
    const stamp = new Date().toISOString();
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read_at: stamp } : n)));
    await supabase.from('notifications').update({ read_at: stamp }).eq('id', id);
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!user) return;
    const stamp = new Date().toISOString();
    setNotifications((prev) => prev.map((n) => (n.read_at ? n : { ...n, read_at: stamp })));
    await supabase
      .from('notifications')
      .update({ read_at: stamp })
      .eq('user_id', Number(user.id))
      .is('read_at', null);
  }, [user]);

  return { notifications, unreadCount, loading, refetch, markAsRead, markAllAsRead };
};
