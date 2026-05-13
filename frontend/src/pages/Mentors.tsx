import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Plus, Mail, BookOpen, Users, Trash2, Pencil, AlertTriangle, FileUp, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

/* ─── helpers ─── */
const hashPassword = async (pw: string) => {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pw));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
};

/* ─── Mentor Card ─── */
const MentorCard: React.FC<{
  mentor: User; badgeVariant: 'faculty' | 'mentor'; badgeLabel: string;
  isAdmin: boolean; onEdit: (m: User) => void; onRemove: (m: User) => void;
}> = ({ mentor, badgeVariant, badgeLabel, isAdmin, onEdit, onRemove }) => (
  <div className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-shadow animate-fade-in">
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary font-heading">
          {mentor.name.charAt(0)}
        </div>
        <div>
          <p className="font-medium">{mentor.name}</p>
          <p className="text-xs text-muted-foreground">{mentor.department}</p>
        </div>
      </div>
      <Badge variant={badgeVariant}>{badgeLabel}</Badge>
    </div>
    <div className="space-y-2 text-sm">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Mail className="w-3.5 h-3.5" /><span>{mentor.email}</span>
      </div>
      {mentor.rollNumber && <p className="text-xs text-muted-foreground">Roll: {mentor.rollNumber}</p>}
    </div>
    {isAdmin && (
      <div className="flex gap-2 mt-4">
        <Button variant="outline" size="sm" className="flex-1" onClick={() => onEdit(mentor)}>
          <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
        </Button>
        <Button variant="outline" size="sm" className="flex-1 text-destructive hover:text-destructive" onClick={() => onRemove(mentor)}>
          <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove
        </Button>
      </div>
    )}
  </div>
);

type MentorType = 'faculty' | 'student_mentor';
type DialogMode = 'add' | 'edit' | 'remove' | 'import' | null;

const Mentors: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [mentors, setMentors] = useState<User[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [importData, setImportData] = useState('');
  const [mentorType, setMentorType] = useState<MentorType>('faculty');
  const [formData, setFormData] = useState({ name: '', email: '', department: '', rollNumber: '' });
  const [formError, setFormError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [removingMentor, setRemovingMentor] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);

  const loadMentors = async () => {
    setLoadingData(true);
    const { data } = await supabase
      .from('users')
      .select('id, name, email, role, department, roll_number')
      .in('role', ['faculty', 'student_mentor'])
      .order('name');
    setMentors(
      (data || []).map((u: any) => ({
        id: String(u.id), name: u.name, email: u.email,
        role: u.role as any, department: u.department || '', rollNumber: u.roll_number,
      }))
    );
    setLoadingData(false);
  };

  useEffect(() => { loadMentors(); }, []);

  const facultyMentors = mentors.filter(u => u.role === 'faculty');
  const studentMentors = mentors.filter(u => u.role === 'student_mentor');

  const resetForm = () => {
    setFormData({ name: '', email: '', department: '', rollNumber: '' });
    setFormError(''); setMentorType('faculty'); setEditingId(null); setRemovingMentor(null);
  };
  const closeDialog = () => { setDialogMode(null); resetForm(); };

  /* ── Add ── */
  const handleAdd = async () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.department.trim()) {
      setFormError('Name, email, and department are required.'); return;
    }
    setSaving(true);
    const pw = await hashPassword('password123');
    const { error } = await supabase.from('users').insert([{
      name: formData.name.trim(), email: formData.email.trim(),
      password: pw, role: mentorType,
      department: formData.department.trim(),
      roll_number: mentorType === 'student_mentor' ? formData.rollNumber.trim() || null : null,
    }]);
    setSaving(false);
    if (error) { setFormError(error.message); return; }
    toast({ title: 'Mentor added successfully' });
    await loadMentors();
    closeDialog();
  };

  /* ── Edit ── */
  const openEdit = (mentor: User) => {
    setEditingId(mentor.id);
    setMentorType(mentor.role as MentorType);
    setFormData({ name: mentor.name, email: mentor.email, department: mentor.department || '', rollNumber: mentor.rollNumber || '' });
    setFormError(''); setDialogMode('edit');
  };

  const handleEdit = async () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.department.trim()) {
      setFormError('Name, email, and department are required.'); return;
    }
    setSaving(true);
    const { error } = await supabase.from('users').update({
      name: formData.name.trim(), email: formData.email.trim(),
      department: formData.department.trim(), role: mentorType,
      roll_number: mentorType === 'student_mentor' ? formData.rollNumber.trim() || null : null,
    }).eq('id', editingId);
    setSaving(false);
    if (error) { setFormError(error.message); return; }
    toast({ title: 'Mentor updated' });
    await loadMentors();
    closeDialog();
  };

  /* ── Remove ── */
  const openRemove = (mentor: User) => { setRemovingMentor(mentor); setDialogMode('remove'); };
  const handleRemove = async () => {
    if (!removingMentor) return;
    setSaving(true);
    const { error } = await supabase.from('users').delete().eq('id', removingMentor.id);
    setSaving(false);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Mentor removed' });
    await loadMentors();
    closeDialog();
  };

  /* ── Import ── */
  const handleImport = async () => {
    if (!importData.trim()) return;
    const lines = importData.trim().split('\n');
    const pw = await hashPassword('password123');
    const rows = lines.map(line => {
      const [name, email, department, role, roll] = line.split(',').map(s => s.trim());
      if (!name || !email) return null;
      return {
        name, email, password: pw, department: department || 'CSE',
        role: role?.toLowerCase().includes('faculty') ? 'faculty' : 'student_mentor',
        roll_number: roll || null,
      };
    }).filter(Boolean);

    if (rows.length === 0) return;
    const { error } = await supabase.from('users').insert(rows as any[]);
    if (error) { toast({ title: 'Import failed', description: error.message, variant: 'destructive' }); return; }
    toast({ title: `Imported ${rows.length} mentor(s)` });
    await loadMentors();
    setImportData(''); setDialogMode(null);
  };

  const renderForm = () => (
    <div className="space-y-4 py-2">
      <div className="space-y-2">
        <Label>Mentor Type</Label>
        <div className="flex gap-2">
          {(['faculty', 'student_mentor'] as MentorType[]).map(t => (
            <button key={t} type="button" onClick={() => setMentorType(t)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                mentorType === t
                  ? t === 'faculty' ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-300 text-blue-700' : 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 text-emerald-700'
                  : 'border-border text-muted-foreground hover:bg-muted/50'
              }`}>
              {t === 'faculty' ? <><BookOpen className="w-4 h-4" /> Faculty</> : <><Users className="w-4 h-4" /> Student</>}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Full Name *</Label>
        <Input placeholder={mentorType === 'faculty' ? 'Prof. Name' : 'Student Name'} value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} />
      </div>
      <div className="space-y-2">
        <Label>Email *</Label>
        <Input type="email" placeholder="name@mlrit.ac.in" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} />
      </div>
      <div className="space-y-2">
        <Label>Department *</Label>
        <Input placeholder="e.g. CSE, ECE" value={formData.department} onChange={e => setFormData(p => ({ ...p, department: e.target.value }))} />
      </div>
      {mentorType === 'student_mentor' && (
        <div className="space-y-2">
          <Label>Roll Number</Label>
          <Input placeholder="e.g. 22B01A0501" value={formData.rollNumber} onChange={e => setFormData(p => ({ ...p, rollNumber: e.target.value }))} />
        </div>
      )}
      {formError && <p className="text-destructive text-sm">{formError}</p>}
    </div>
  );

  if (loadingData) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Mentors</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isAdmin ? 'Manage faculty and student mentors' : 'View faculty and student mentors'}
          </p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setDialogMode('import')}>
              <FileUp className="w-4 h-4 mr-2" /> Import
            </Button>
            <Button onClick={() => { resetForm(); setDialogMode('add'); }}>
              <Plus className="w-4 h-4 mr-2" /> Add Mentor
            </Button>
          </div>
        )}
      </div>

      {/* Import Dialog */}
      <Dialog open={dialogMode === 'import'} onOpenChange={open => { if (!open) setDialogMode(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Import Mentors</DialogTitle>
            <DialogDescription>CSV format: Name, Email, Department, Role (Faculty/Mentor), RollNumber</DialogDescription>
          </DialogHeader>
          <textarea className="w-full h-40 p-3 rounded-md border border-input bg-background font-mono text-xs"
            placeholder="Prof. John, john@mlrit.ac.in, CSE, Faculty&#10;Jane, jane@mlrit.ac.in, ECE, Mentor, 22B01A0401"
            value={importData} onChange={e => setImportData(e.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogMode(null)}>Cancel</Button>
            <Button onClick={handleImport}>Import All</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogMode === 'add' || dialogMode === 'edit'} onOpenChange={open => { if (!open) closeDialog(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{dialogMode === 'edit' ? 'Edit Mentor' : 'Add New Mentor'}</DialogTitle>
          </DialogHeader>
          {renderForm()}
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button onClick={dialogMode === 'edit' ? handleEdit : handleAdd} disabled={saving}
              className={mentorType === 'faculty' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}>
              {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <>{dialogMode === 'edit' ? <Pencil className="w-4 h-4 mr-1" /> : <Plus className="w-4 h-4 mr-1" />}</>}
              {dialogMode === 'edit' ? 'Save Changes' : `Add ${mentorType === 'faculty' ? 'Faculty' : 'Student'} Mentor`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Dialog */}
      <Dialog open={dialogMode === 'remove'} onOpenChange={open => { if (!open) closeDialog(); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-destructive" /> Remove Mentor</DialogTitle>
            <DialogDescription>Are you sure you want to remove <strong>{removingMentor?.name}</strong>?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button variant="destructive" onClick={handleRemove} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Trash2 className="w-4 h-4 mr-1" />} Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Faculty Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center"><BookOpen className="w-4 h-4 text-blue-500" /></div>
          <div><h2 className="text-lg font-heading font-semibold">Faculty Mentors</h2><p className="text-xs text-muted-foreground">Faculty members assigned to guide project sections</p></div>
          <span className="ml-auto text-xs font-medium bg-blue-50 dark:bg-blue-500/10 text-blue-600 px-2.5 py-1 rounded-full">{facultyMentors.length} members</span>
        </div>
        {facultyMentors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {facultyMentors.map(m => <MentorCard key={m.id} mentor={m} isAdmin={isAdmin} badgeVariant="faculty" badgeLabel="Faculty Mentor" onEdit={openEdit} onRemove={openRemove} />)}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground text-sm">No faculty mentors found.</div>
        )}
      </section>

      <div className="border-t border-border" />

      {/* Student Mentors Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center"><Users className="w-4 h-4 text-emerald-500" /></div>
          <div><h2 className="text-lg font-heading font-semibold">Student Mentors</h2><p className="text-xs text-muted-foreground">Senior students appointed to mentor project teams</p></div>
          <span className="ml-auto text-xs font-medium bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 px-2.5 py-1 rounded-full">{studentMentors.length} members</span>
        </div>
        {studentMentors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {studentMentors.map(m => <MentorCard key={m.id} mentor={m} isAdmin={isAdmin} badgeVariant="mentor" badgeLabel="Student Mentor" onEdit={openEdit} onRemove={openRemove} />)}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground text-sm">No student mentors found.</div>
        )}
      </section>
    </div>
  );
};

export default Mentors;
