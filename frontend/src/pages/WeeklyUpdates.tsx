import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ClipboardList, Plus, Save, Trash2, Loader2, Search } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface UpdateRow {
  id: number;
  user_id: number;
  week_starting: string;
  content: string;
  created_at: string;
  updated_at: string;
  mentorName?: string;
  mentorRole?: string;
}

const mondayOf = (d = new Date()) => {
  const day = d.getDay();           // 0 (Sun) .. 6 (Sat)
  const diff = (day === 0 ? -6 : 1) - day;
  const m = new Date(d);
  m.setDate(d.getDate() + diff);
  m.setHours(0, 0, 0, 0);
  return m.toISOString().slice(0, 10);
};

const WeeklyUpdates: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const canWrite = user?.role === 'student_mentor' || user?.role === 'faculty';

  const [list, setList] = useState<UpdateRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const [draft, setDraft] = useState({ week_starting: mondayOf(), content: '' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const base = supabase
        .from('weekly_updates')
        .select('id, user_id, week_starting, content, created_at, updated_at, users!inner(name, role)')
        .order('week_starting', { ascending: false });
      const query = isAdmin
        ? base
        : base.eq('user_id', Number(user.id));
      const { data } = await query;
      setList(
        ((data || []) as any[]).map(r => ({
          id: r.id, user_id: r.user_id, week_starting: r.week_starting,
          content: r.content, created_at: r.created_at, updated_at: r.updated_at,
          mentorName: r.users?.name, mentorRole: r.users?.role,
        }))
      );
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!user) return;
    if (!draft.content.trim()) {
      toast({ title: 'Update is empty', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from('weekly_updates')
        .upsert({
          user_id: Number(user.id),
          week_starting: draft.week_starting,
          content: draft.content.trim(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,week_starting' });
      if (error) throw error;
      toast({ title: 'Weekly update saved' });
      setDraft(p => ({ ...p, content: '' }));
      await load();
    } catch (err: any) {
      toast({ title: 'Save failed', description: err?.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    const { error } = await supabase.from('weekly_updates').delete().eq('id', id);
    if (error) { toast({ title: 'Delete failed', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Deleted' });
    setList(prev => prev.filter(u => u.id !== id));
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return list;
    return list.filter(r =>
      (r.mentorName || '').toLowerCase().includes(q)
      || r.content.toLowerCase().includes(q)
      || r.week_starting.includes(q)
    );
  }, [list, search]);

  if (!isAdmin && !canWrite) {
    return <div className="p-8 text-center text-muted-foreground">No access.</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-primary" /> Weekly Updates
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {isAdmin ? 'Mentor weekly reports' : 'Submit your weekly update for your assigned section'}
        </p>
      </div>

      {/* Compose (mentors only) */}
      {canWrite && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-primary" />
            <h2 className="font-heading font-semibold text-sm">New / Update Entry</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-3 items-start">
            <div className="space-y-1.5">
              <Label htmlFor="wk" className="text-xs">Week starting</Label>
              <Input id="wk" type="date" value={draft.week_starting}
                onChange={e => setDraft(p => ({ ...p, week_starting: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="content" className="text-xs">Update</Label>
              <textarea
                id="content"
                className="w-full text-sm rounded-md border border-input bg-background p-2 min-h-[100px] resize-y"
                placeholder="What did your section accomplish this week? Blockers? Plans for next week?"
                value={draft.content}
                onChange={e => setDraft(p => ({ ...p, content: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save (upserts this week)
            </Button>
          </div>
        </div>
      )}

      {/* Feed */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-3 border-b border-border flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search by mentor, content, or date…"
              className="pl-8 h-9 text-sm"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <span className="text-xs text-muted-foreground">{filtered.length} of {list.length}</span>
        </div>

        {loading ? (
          <div className="p-10 text-center"><Loader2 className="w-5 h-5 animate-spin inline" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground text-sm">
            {list.length === 0 ? (canWrite ? 'No updates yet — write your first one above.' : 'No mentor updates yet.') : 'No matches'}
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map(r => (
              <li key={r.id} className="p-4 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">
                      Week of {new Date(r.week_starting).toLocaleDateString('en-GB')}
                    </p>
                    {isAdmin && r.mentorName && (
                      <p className="text-xs text-muted-foreground">
                        {r.mentorName} · {r.mentorRole === 'faculty' ? 'Faculty' : 'Student Mentor'}
                      </p>
                    )}
                  </div>
                  {(isAdmin || (canWrite && r.user_id === Number(user?.id))) && (
                    <button onClick={() => handleDelete(r.id)} title="Delete"
                      className="text-muted-foreground hover:text-destructive p-1">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{r.content}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default WeeklyUpdates;
