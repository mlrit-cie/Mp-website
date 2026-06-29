import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Mail, Phone, Building, Hash, Edit, Save, X, Github, Linkedin, Loader2,
  Layers, FolderKanban, ClipboardCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import PendingApprovalsPanel from '@/components/PendingApprovalsPanel';
import { PremiumCard } from '@/components/ui/premium-card';

interface MentorSummary {
  sections: { id: number; name: string; department: string | null }[];
  teamCount: number;
  pendingReviews: number;
  reviewStatusLabel: string;
}

const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mentorSummary, setMentorSummary] = useState<MentorSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    githubLink: user?.githubLink || '',
    linkedinLink: user?.linkedinLink || '',
  });

  const isMentor = user?.role === 'faculty' || user?.role === 'student_mentor';
  const isAdmin  = user?.role === 'admin';

  useEffect(() => {
    if (!user || !isMentor) { setMentorSummary(null); return; }
    let cancelled = false;
    (async () => {
      setSummaryLoading(true);
      try {
        const { data: assignments } = await supabase
          .from('mentor_assignments')
          .select('section_id, sections!inner(id, name, department)')
          .eq('user_id', Number(user.id));

        const sections = ((assignments || []) as any[])
          .map(a => a.sections)
          .filter(Boolean);

        const sectionIds = sections.map(s => s.id);
        const reviewStatus = user.role === 'faculty' ? 'Faculty Review' : 'Student Mentor Review';

        let teamCount = 0;
        let pendingReviews = 0;
        if (sectionIds.length > 0) {
          const [teams, reviews] = await Promise.all([
            supabase.from('teams').select('id', { count: 'exact', head: true }).in('section_id', sectionIds),
            supabase.from('projects').select('id', { count: 'exact', head: true })
              .in('section_id', sectionIds).eq('status', reviewStatus),
          ]);
          teamCount = teams.count ?? 0;
          pendingReviews = reviews.count ?? 0;
        }

        if (!cancelled) {
          setMentorSummary({
            sections, teamCount, pendingReviews, reviewStatusLabel: reviewStatus,
          });
        }
      } finally {
        if (!cancelled) setSummaryLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user, isMentor]);

  if (!user) return null;

  const roleLabel: Record<string, string> = {
    admin: 'Admin',
    faculty: 'Faculty Mentor',
    student_mentor: 'Student Mentor',
    student: 'Student',
  };

  const roleBadgeVariant: Record<string, 'admin' | 'faculty' | 'mentor' | 'student'> = {
    admin: 'admin',
    faculty: 'faculty',
    student_mentor: 'mentor',
    student: 'student',
  };

  const handleEdit = () => {
    setForm({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      githubLink: user.githubLink || '',
      linkedinLink: user.linkedinLink || '',
    });
    setEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    await updateProfile(form);
    setSaving(false);
    setEditing(false);
    toast({ title: 'Profile updated', description: 'Your changes have been saved.' });
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Profile</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {isMentor ? 'Your account, assigned sections, and pending workload' : 'Your account information'}
        </p>
      </div>

      <PremiumCard interactive="subtle" className="p-6 md:p-8">
        <div className="flex items-start gap-5">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary font-heading shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-heading font-bold">{user.name}</h2>
              <Badge variant={roleBadgeVariant[user.role]}>{roleLabel[user.role]}</Badge>
            </div>

            {!editing ? (
              <>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Mail className="w-4 h-4 shrink-0" /><span>{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Phone className="w-4 h-4 shrink-0" /><span>{user.phone}</span>
                    </div>
                  )}
                  {user.department && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Building className="w-4 h-4 shrink-0" /><span>{user.department}</span>
                    </div>
                  )}
                  {user.rollNumber && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Hash className="w-4 h-4 shrink-0" /><span>{user.rollNumber}</span>
                    </div>
                  )}
                  {user.githubLink && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Github className="w-4 h-4 shrink-0" />
                      <a href={user.githubLink} target="_blank" rel="noopener noreferrer"
                        className="hover:text-primary transition-colors truncate">{user.githubLink}</a>
                    </div>
                  )}
                  {user.linkedinLink && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Linkedin className="w-4 h-4 shrink-0" />
                      <a href={user.linkedinLink} target="_blank" rel="noopener noreferrer"
                        className="hover:text-primary transition-colors truncate">{user.linkedinLink}</a>
                    </div>
                  )}
                </div>
                <Button variant="outline" size="sm" className="mt-5" onClick={handleEdit}>
                  <Edit className="w-3.5 h-3.5 mr-2" /> Edit Profile
                </Button>
              </>
            ) : (
              <div className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="p-name">Name</Label>
                  <Input id="p-name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="p-email">Email</Label>
                  <Input id="p-email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="p-phone">Phone</Label>
                  <Input id="p-phone" placeholder="+91 9876543210" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="p-github">GitHub</Label>
                  <Input id="p-github" placeholder="https://github.com/username" value={form.githubLink} onChange={e => setForm(f => ({ ...f, githubLink: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="p-linkedin">LinkedIn</Label>
                  <Input id="p-linkedin" placeholder="https://linkedin.com/in/username" value={form.linkedinLink} onChange={e => setForm(f => ({ ...f, linkedinLink: e.target.value }))} />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSave} disabled={saving}>
                    {saving ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-2" />}
                    Save
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setEditing(false)} disabled={saving}>
                    <X className="w-3.5 h-3.5 mr-2" /> Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </PremiumCard>

      {/* Admin-only: pending approvals (also surfaced on the dashboard) */}
      {isAdmin && <PendingApprovalsPanel variant="amber" />}

      {/* Mentor-only: assigned workload */}
      {isMentor && (
        <PremiumCard interactive="subtle" index={1} className="p-6 md:p-8 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-heading font-semibold">Mentor Workload</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Sections assigned to you and what's pending</p>
            </div>
            {summaryLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Layers className="w-3.5 h-3.5" /> Sections
              </div>
              <p className="text-2xl font-bold mt-1">{mentorSummary?.sections.length ?? 0}</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <FolderKanban className="w-3.5 h-3.5" /> Teams
              </div>
              <p className="text-2xl font-bold mt-1">{mentorSummary?.teamCount ?? 0}</p>
            </div>
            <div className={`rounded-lg border p-4 ${
              (mentorSummary?.pendingReviews ?? 0) > 0
                ? 'border-destructive/40 bg-destructive/5'
                : 'border-border bg-muted/30'
            }`}>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <ClipboardCheck className="w-3.5 h-3.5" /> Pending Reviews
              </div>
              <p className="text-2xl font-bold mt-1">{mentorSummary?.pendingReviews ?? 0}</p>
              {mentorSummary && (
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {mentorSummary.reviewStatusLabel}
                </p>
              )}
            </div>
          </div>

          {/* Assigned section list */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Assigned Sections</p>
              <Link to="/sections" className="text-xs text-primary hover:underline">View all sections</Link>
            </div>
            {(mentorSummary?.sections.length ?? 0) === 0 ? (
              <p className="text-xs text-muted-foreground italic py-4 text-center bg-muted/20 rounded-lg border border-dashed border-border">
                No sections assigned to you yet. Ask an admin to add you to a section.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {mentorSummary!.sections.map(s => (
                  <div key={s.id} className="p-3 rounded-lg border border-border bg-muted/20 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{s.name}</p>
                      {s.department && (
                        <p className="text-[10px] text-muted-foreground">{s.department}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
      </PremiumCard>
      )}
    </div>
  );
};

export default Profile;
