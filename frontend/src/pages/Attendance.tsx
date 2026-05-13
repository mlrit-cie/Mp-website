import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarIcon, Check, X, Clock, Download, Loader2, Search } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { exportToExcel } from '@/lib/export';
import { cn } from '@/lib/utils';

type Status = 'present' | 'absent' | 'late';

interface MentorRow {
  id: number;
  name: string;
  email: string;
  role: 'faculty' | 'student_mentor';
  status: Status | null;
  notes: string;
  dirty: boolean;
}

const todayIso = () => new Date().toISOString().slice(0, 10);

const Attendance: React.FC = () => {
  const { user } = useAuth();
  const [date, setDate] = useState<string>(todayIso());
  const [rows, setRows] = useState<MentorRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const load = useCallback(async (forDate: string) => {
    setLoading(true);
    try {
      const [mentorsRes, recordsRes] = await Promise.all([
        supabase.from('users')
          .select('id, name, email, role')
          .in('role', ['faculty', 'student_mentor'])
          .order('name'),
        supabase.from('attendance')
          .select('user_id, status, notes')
          .eq('attendance_date', forDate),
      ]);
      const recordMap = new Map<number, { status: Status; notes: string | null }>();
      (recordsRes.data || []).forEach((r: any) => recordMap.set(r.user_id, { status: r.status, notes: r.notes }));
      setRows(
        (mentorsRes.data || []).map((m: any) => {
          const rec = recordMap.get(m.id);
          return {
            id: m.id, name: m.name, email: m.email, role: m.role,
            status: rec?.status ?? null,
            notes: rec?.notes ?? '',
            dirty: false,
          };
        })
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(date); }, [date, load]);

  const setStatus = (userId: number, status: Status) => {
    setRows(prev => prev.map(r => r.id === userId
      ? { ...r, status, dirty: true }
      : r));
  };

  const setNotes = (userId: number, notes: string) => {
    setRows(prev => prev.map(r => r.id === userId
      ? { ...r, notes, dirty: true }
      : r));
  };

  const handleSave = async () => {
    const changed = rows.filter(r => r.dirty && r.status !== null);
    if (changed.length === 0) {
      toast({ title: 'Nothing to save' });
      return;
    }
    if (!user) return;
    setSaving(true);
    try {
      const payload = changed.map(r => ({
        user_id: r.id,
        attendance_date: date,
        status: r.status as Status,
        notes: r.notes || null,
        marked_by: Number(user.id),
        marked_at: new Date().toISOString(),
      }));
      const { error } = await supabase
        .from('attendance')
        .upsert(payload, { onConflict: 'user_id,attendance_date' });
      if (error) throw error;
      toast({ title: `Saved attendance for ${changed.length} mentor${changed.length === 1 ? '' : 's'}` });
      await load(date);
    } catch (err: any) {
      toast({ title: 'Save failed', description: err?.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    // Export the past 30 days for all mentors
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const { data } = await supabase
      .from('attendance')
      .select('attendance_date, status, notes, users!inner(name, email, role)')
      .gte('attendance_date', since)
      .order('attendance_date', { ascending: false })
      .order('user_id');
    const exportRows = (data || []).map((r: any) => ({
      Date: r.attendance_date,
      Name: r.users?.name,
      Email: r.users?.email,
      Role: r.users?.role,
      Status: r.status,
      Notes: r.notes || '',
    }));
    if (exportRows.length === 0) {
      toast({ title: 'No attendance records in the past 30 days' });
      return;
    }
    exportToExcel(exportRows, `attendance_${date}`, 'Attendance');
    toast({ title: 'Attendance exported (last 30 days)' });
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return rows;
    return rows.filter(r =>
      r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q));
  }, [rows, search]);

  const stats = useMemo(() => {
    return {
      total: rows.length,
      present: rows.filter(r => r.status === 'present').length,
      absent: rows.filter(r => r.status === 'absent').length,
      late: rows.filter(r => r.status === 'late').length,
      unmarked: rows.filter(r => r.status === null).length,
    };
  }, [rows]);

  if (user?.role !== 'admin') {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Attendance is admin-only.
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-primary" /> Mentor Attendance
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Mark and export attendance for faculty and student mentors</p>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="date" className="text-xs whitespace-nowrap">Date:</Label>
          <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} className="w-40" />
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
        </div>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg border bg-card p-3">
          <p className="text-[10px] text-muted-foreground uppercase">Total</p>
          <p className="text-xl font-bold">{stats.total}</p>
        </div>
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 dark:bg-emerald-500/10 dark:border-emerald-500/30 p-3">
          <p className="text-[10px] text-emerald-700 dark:text-emerald-400 uppercase">Present</p>
          <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400">{stats.present}</p>
        </div>
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
          <p className="text-[10px] text-destructive uppercase">Absent</p>
          <p className="text-xl font-bold text-destructive">{stats.absent}</p>
        </div>
        <div className="rounded-lg border border-blue-200 bg-blue-50/50 dark:bg-blue-500/10 dark:border-blue-500/30 p-3">
          <p className="text-[10px] text-blue-700 dark:text-blue-400 uppercase">Late</p>
          <p className="text-xl font-bold text-blue-700 dark:text-blue-400">{stats.late}</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-3 border-b border-border flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search mentors by name or email…"
              className="pl-8 h-9 text-sm"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Button onClick={handleSave} disabled={saving || !rows.some(r => r.dirty)}>
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save
          </Button>
        </div>

        {loading ? (
          <div className="p-10 text-center"><Loader2 className="w-5 h-5 animate-spin inline" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground text-sm">
            {rows.length === 0 ? 'No mentors found' : 'No mentors match your search'}
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map(r => (
              <li key={r.id} className="p-3 flex flex-col md:flex-row md:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{r.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {r.email} • {r.role === 'faculty' ? 'Faculty' : 'Student Mentor'}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {(['present', 'absent', 'late'] as Status[]).map(s => (
                    <button
                      key={s}
                      onClick={() => setStatus(r.id, s)}
                      title={s}
                      className={cn(
                        'h-8 px-3 text-xs rounded-md border flex items-center gap-1 transition-all',
                        r.status === s
                          ? s === 'present'
                            ? 'bg-emerald-100 border-emerald-400 text-emerald-700 dark:bg-emerald-500/20'
                            : s === 'absent'
                              ? 'bg-destructive/10 border-destructive/40 text-destructive'
                              : 'bg-blue-100 border-blue-400 text-blue-700 dark:bg-blue-500/20'
                          : 'border-border hover:bg-muted'
                      )}
                    >
                      {s === 'present' && <Check className="w-3 h-3" />}
                      {s === 'absent'  && <X     className="w-3 h-3" />}
                      {s === 'late'    && <Clock className="w-3 h-3" />}
                      <span className="capitalize">{s}</span>
                    </button>
                  ))}
                </div>
                <Input
                  placeholder="notes (optional)"
                  className="md:w-48 h-8 text-xs"
                  value={r.notes}
                  onChange={e => setNotes(r.id, e.target.value)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Attendance;
