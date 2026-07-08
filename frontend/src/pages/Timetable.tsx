import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Calendar as CalendarIcon, MapPin, Plus, Trash2, Pencil, Bell, Info, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { PremiumCard } from '@/components/ui/premium-card';

type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SESSIONS = [
  { id: '1', label: 'Session 1', start: '10:20', end: '12:20' },
  { id: '2', label: 'Session 2', start: '14:10', end: '16:10' },
];

interface TimetableEntry {
  id: string;
  section_id: string;
  section_name: string;
  day_of_week: DayOfWeek;
  start_time: string;
  end_time: string;
  subject: string;
  room_number: string;
  faculty_id: string | null;
  faculty_name: string;
  student_mentor_ids: number[];
  student_mentor_names: string[];
}

const Timetable: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isFacultyOrMentor = user?.role === 'faculty' || user?.role === 'student_mentor';

  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [studentMentorList, setStudentMentorList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    section_id: '', day_of_week: 'Monday' as DayOfWeek,
    start_time: '10:20', end_time: '12:20',
    subject: 'Project Lab', room_number: '',
    faculty_id: '', student_mentor_ids: [] as number[],
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [ttRes, secRes, usersRes] = await Promise.all([
        supabase.from('timetable').select('*').order('day_of_week').order('start_time'),
        supabase.from('sections').select('id, name, department, faculty_mentor_id, student_mentor_ids'),
        supabase.from('users').select('id, name, role').in('role', ['faculty', 'student_mentor']),
      ]);

      const allUsers: any[] = usersRes.data || [];
      const userMap: Record<number, string> = {};
      allUsers.forEach((u: any) => { userMap[u.id] = u.name; });

      const secMap: Record<number, string> = {};
      (secRes.data || []).forEach((s: any) => { secMap[s.id] = s.name; });

      setSections(secRes.data || []);
      // Master lists, used as a fallback when no section is picked
      setFacultyList(allUsers.filter(u => u.role === 'faculty'));
      setStudentMentorList(allUsers.filter(u => u.role === 'student_mentor'));

      setEntries(
        (ttRes.data || []).map((e: any) => ({
          id: String(e.id),
          section_id: String(e.section_id),
          section_name: secMap[e.section_id] || '—',
          day_of_week: e.day_of_week,
          start_time: e.start_time?.slice(0, 5) || '',
          end_time: e.end_time?.slice(0, 5) || '',
          subject: e.subject || 'Project Lab',
          room_number: e.room_number || '',
          faculty_id: e.faculty_id ? String(e.faculty_id) : null,
          faculty_name: e.faculty_id ? (userMap[e.faculty_id] || '—') : '—',
          student_mentor_ids: Array.isArray(e.student_mentor_ids) ? e.student_mentor_ids : [],
          student_mentor_names: Array.isArray(e.student_mentor_ids)
            ? e.student_mentor_ids.map((id: number) => userMap[id] || '—')
            : [],
        }))
      );
    } catch (err) {
      console.error('loadData error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // Filter entries for faculty/mentor view
  const myEntries = useMemo(() => {
    if (!isFacultyOrMentor || !user) return entries;
    if (user.role === 'faculty') return entries.filter(e => e.faculty_id === user.id);
    return entries.filter(e => e.student_mentor_ids.includes(Number(user.id)));
  }, [entries, user, isFacultyOrMentor]);

  // Scope mentor pickers to the section the admin is creating/editing a slot for.
  // Spec: "admin reassigns mentors weekly" → mentors come from the section's assigned pool.
  const selectedSection: any = useMemo(
    () => sections.find((s: any) => String(s.id) === form.section_id) || null,
    [sections, form.section_id],
  );

  const scopedFacultyList = useMemo(() => {
    if (!selectedSection?.faculty_mentor_id) return [];
    return facultyList.filter(f => Number(f.id) === Number(selectedSection.faculty_mentor_id));
  }, [facultyList, selectedSection]);

  const scopedStudentMentorList = useMemo(() => {
    const ids = (selectedSection?.student_mentor_ids ?? []) as number[];
    if (ids.length === 0) return [];
    const idSet = new Set(ids.map(Number));
    return studentMentorList.filter(m => idSet.has(Number(m.id)));
  }, [studentMentorList, selectedSection]);

  const todaysClasses = useMemo(() => {
    const today = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date()) as DayOfWeek;
    return myEntries.filter(e => e.day_of_week === today).sort((a, b) => a.start_time.localeCompare(b.start_time));
  }, [myEntries]);

  const openAdd = () => {
    setEditingEntry(null);
    setForm({ section_id: sections[0]?.id ? String(sections[0].id) : '', day_of_week: 'Monday', start_time: '10:20', end_time: '12:20', subject: 'Project Lab', room_number: '', faculty_id: '', student_mentor_ids: [] });
    setDialogOpen(true);
  };

  const openEdit = (entry: TimetableEntry) => {
    setEditingEntry(entry);
    setForm({
      section_id: entry.section_id, day_of_week: entry.day_of_week,
      start_time: entry.start_time, end_time: entry.end_time,
      subject: entry.subject, room_number: entry.room_number,
      faculty_id: entry.faculty_id || '', student_mentor_ids: entry.student_mentor_ids,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.section_id || !form.room_number) {
      toast({ title: 'Section and room are required', variant: 'destructive' }); return;
    }
    setSaving(true);
    const payload = {
      section_id: Number(form.section_id),
      day_of_week: form.day_of_week,
      start_time: form.start_time,
      end_time: form.end_time,
      subject: form.subject,
      room_number: form.room_number,
      faculty_id: form.faculty_id ? Number(form.faculty_id) : null,
      student_mentor_ids: form.student_mentor_ids,
    };

    const { error } = editingEntry
      ? await supabase.from('timetable').update(payload).eq('id', editingEntry.id)
      : await supabase.from('timetable').insert([payload]);

    setSaving(false);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    toast({ title: editingEntry ? 'Schedule updated' : 'Schedule added' });
    setDialogOpen(false);
    await loadData();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('timetable').delete().eq('id', id);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Schedule removed' });
    await loadData();
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-primary" /> Time Table
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isAdmin ? 'Manage project classes and mentor schedules' : 'Your assigned class schedule'}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={openAdd}><Plus className="w-4 h-4 mr-2" /> Add Schedule Slot</Button>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingEntry ? 'Edit Slot' : 'Add New Schedule Slot'}</DialogTitle>
            <DialogDescription>Setup a class timing for a section and mentor.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Section *</Label>
                <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  value={form.section_id}
                  onChange={e => setForm(p => ({
                    // Switching section invalidates the mentor selections (different pool).
                    ...p,
                    section_id: e.target.value,
                    faculty_id: '',
                    student_mentor_ids: [],
                  }))}>
                  <option value="">Select Section</option>
                  {sections.map((s: any) => <option key={s.id} value={s.id}>{s.name} ({s.department})</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Room *</Label>
                <Input placeholder="e.g. LHC-101" value={form.room_number} onChange={e => setForm(p => ({ ...p, room_number: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Day</Label>
                <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  value={form.day_of_week} onChange={e => setForm(p => ({ ...p, day_of_week: e.target.value as DayOfWeek }))}>
                  {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Session</Label>
                <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  value={SESSIONS.find(s => s.start === form.start_time)?.id || '1'}
                  onChange={e => {
                    const s = SESSIONS.find(s => s.id === e.target.value);
                    if (s) setForm(p => ({ ...p, start_time: s.start, end_time: s.end }));
                  }}>
                  {SESSIONS.map(s => <option key={s.id} value={s.id}>{s.label} ({s.start}–{s.end})</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Faculty Mentor</Label>
              <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                value={form.faculty_id}
                disabled={!form.section_id}
                onChange={e => setForm(p => ({ ...p, faculty_id: e.target.value }))}>
                <option value="">{form.section_id ? (scopedFacultyList.length ? 'None' : 'No faculty assigned to this section') : 'Pick a section first'}</option>
                {scopedFacultyList.map((f: any) => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Student Mentors</Label>
              {!form.section_id ? (
                <p className="text-[11px] text-muted-foreground italic p-3 border border-dashed rounded-md">
                  Pick a section first — student mentors are scoped to that section.
                </p>
              ) : scopedStudentMentorList.length === 0 ? (
                <p className="text-[11px] text-muted-foreground italic p-3 border border-dashed rounded-md">
                  No student mentors assigned to this section yet. Assign them in the Sections page first.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 border rounded-md">
                  {scopedStudentMentorList.map((m: any) => (
                    <label key={m.id} className="flex items-center gap-2 text-xs p-1 rounded cursor-pointer hover:bg-muted">
                      <input type="checkbox" checked={form.student_mentor_ids.includes(m.id)}
                        onChange={e => setForm(p => ({
                          ...p, student_mentor_ids: e.target.checked
                            ? [...p.student_mentor_ids, m.id]
                            : p.student_mentor_ids.filter(id => id !== m.id),
                        }))} />
                      <span className="truncate">{m.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-1 animate-spin" />} Save Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Faculty/Mentor view with today's summary */}
      {isFacultyOrMentor && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <PremiumCard index={0} interactive="subtle" className="border-primary/20 bg-primary/5 p-5">
              <h3 className="text-lg font-heading font-semibold text-primary flex items-center gap-2 mb-3">
                <Bell className="w-5 h-5" /> Today's Schedule
              </h3>
              {todaysClasses.length > 0 ? (
                <div className="space-y-3">
                  {todaysClasses.map(e => (
                    <div key={e.id} className="flex gap-3 bg-white/[0.03] p-3 rounded-xl border border-primary/10">
                      <div className="flex flex-col items-center justify-center bg-primary text-white px-2 py-1 rounded-lg text-[10px] font-bold min-w-[60px]">
                        <span>{e.start_time}</span>
                        <div className="w-full h-[1px] bg-white/30 my-0.5" />
                        <span>{e.end_time}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{e.section_name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" /> {e.room_number}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No classes today.</p>
              )}
            </PremiumCard>
            <PremiumCard index={1} interactive="subtle" className="p-5">
              <h3 className="text-sm font-heading font-semibold flex items-center gap-2 mb-4"><Info className="w-4 h-4 text-muted-foreground" /> Schedule Info</h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between"><span className="text-muted-foreground">Weekly Load</span><span className="font-medium">{myEntries.length} Classes</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Active Sections</span><span className="font-medium text-primary">{new Set(myEntries.map(e => e.section_id)).size} Sections</span></div>
              </div>
            </PremiumCard>
          </div>
          <div className="lg:col-span-2">
            <TimetableGrid entries={myEntries} isAdmin={false} onEdit={openEdit} onDelete={handleDelete} />
          </div>
        </div>
      )}

      {/* Admin / Student full grid */}
      {(isAdmin || user?.role === 'student') && (
        <TimetableGrid entries={isAdmin ? entries : myEntries} isAdmin={isAdmin} onEdit={openEdit} onDelete={handleDelete} />
      )}
    </div>
  );
};

const TimetableGrid: React.FC<{
  entries: TimetableEntry[]; isAdmin: boolean;
  onEdit: (e: TimetableEntry) => void; onDelete: (id: string) => void;
}> = ({ entries, isAdmin, onEdit, onDelete }) => (
  <PremiumCard index={2} interactive={false} className="overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-muted/50 border-b border-border">
            <th className="py-4 px-4 text-left font-heading text-sm font-semibold w-32">Session</th>
            {DAYS.map(day => (
              <th key={day} className="py-4 px-4 text-center font-heading text-sm font-semibold min-w-[140px]">{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {SESSIONS.map((session, idx) => (
            <tr key={session.id} className={cn('border-b border-border/50', idx % 2 === 0 ? 'bg-white/[0.02]' : 'bg-transparent')}>
              <td className="py-6 px-4 border-r border-border/50">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-primary">{session.label}</span>
                  <span className="text-[10px] text-muted-foreground italic">{session.start} – {session.end}</span>
                </div>
              </td>
              {DAYS.map(day => {
                const items = entries.filter(e => e.day_of_week === day && e.start_time === session.start);
                return (
                  <td key={day} className="p-2 border-r border-border/50 min-h-[120px] align-top">
                    <div className="space-y-2">
                      {items.map(entry => (
                        <div key={entry.id} className="group relative p-3 rounded-xl border bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 hover:shadow-lg hover:border-primary/40 hover:-translate-y-1 transition-all duration-300">
                          <div className="flex justify-between items-start mb-1">
                            <p className="font-bold text-xs truncate">{entry.section_name}</p>
                            {isAdmin && (
                              <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                                <button onClick={() => onEdit(entry)} className="p-1 hover:text-primary"><Pencil className="w-3.5 h-3.5" /></button>
                                <button onClick={() => onDelete(entry.id)} className="p-1 hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                              </div>
                            )}
                          </div>
                          <p className="text-[10px] text-primary font-bold mb-2">{entry.subject}</p>
                          <div className="space-y-1.5 mb-2">
                            <div className="flex items-center gap-1.5 text-[9px]">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                              <span className="text-muted-foreground">Faculty:</span>
                              <span className="font-medium truncate">{entry.faculty_name}</span>
                            </div>
                            {entry.student_mentor_names.length > 0 && (
                              <div className="flex items-start gap-1.5 text-[9px]">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1" />
                                <span className="text-muted-foreground">Mentors:</span>
                                <div className="flex flex-col">
                                  {entry.student_mentor_names.map((n, i) => <span key={i} className="font-medium truncate">{n}</span>)}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-[9px] text-primary font-medium">
                            <MapPin className="w-2.5 h-2.5" />{entry.room_number}
                          </div>
                        </div>
                      ))}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </PremiumCard>
);

export default Timetable;
