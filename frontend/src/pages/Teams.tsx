import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Users, Mail, Phone, Github, Linkedin, Crown, Download, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useMentor } from '@/hooks/useMentor';

/* ─── Student view: shows their own team ─── */
const StudentTeamView: React.FC = () => {
  const { user } = useAuth();
  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      // Find team membership
      const { data: membership } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('student_id', Number(user.id))
        .single();

      if (!membership) { setLoading(false); return; }

      // Get team + project
      const { data: teamData } = await supabase
        .from('teams')
        .select(`
          id, name, section_id,
          sections(name),
          projects(id, title, domain, status, feedback),
          team_members(
            student_id,
            users!inner(id, name, email, roll_number, phone, github_link, linkedin_link)
          )
        `)
        .eq('id', membership.team_id)
        .single();

      if (teamData) {
        setTeam({
          id: String(teamData.id),
          name: teamData.name,
          sectionName: (teamData as any).sections?.name || '—',
          project: (teamData as any).projects?.[0] || null,
          members: ((teamData as any).team_members || []).map((tm: any) => ({
            id: String(tm.users.id),
            name: tm.users.name,
            email: tm.users.email,
            rollNumber: tm.users.roll_number,
            phone: tm.users.phone,
            githubLink: tm.users.github_link,
            linkedinLink: tm.users.linkedin_link,
          })),
        });
      }
      setLoading(false);
    };
    load();
  }, [user]);

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  if (!team) return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-heading font-bold">My Team</h1></div>
      <div className="rounded-xl border border-dashed border-border p-12 text-center">
        <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <p className="font-medium text-sm">You haven't been assigned to a team yet</p>
        <p className="text-xs text-muted-foreground mt-1">Your mentor will create a team and add you.</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">My Team</h1>
        <p className="text-muted-foreground text-sm mt-1">Your team details</p>
      </div>
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-heading font-semibold">{team.name}</h2>
            <p className="text-xs text-muted-foreground">Section: {team.sectionName}</p>
          </div>
          {team.project && <div className="ml-auto"><StatusBadge status={team.project.status} /></div>}
        </div>

        {team.project && (
          <div className="p-3 rounded-lg bg-muted/30 border border-border/50 mb-4">
            <p className="text-sm font-medium">{team.project.title}</p>
            <p className="text-xs text-muted-foreground">{team.project.domain}</p>
          </div>
        )}

        <h3 className="text-sm font-medium mb-3">Members ({team.members.length})</h3>
        <div className="space-y-3">
          {team.members.map((m: any, i: number) => (
            <div key={m.id} className="p-3 rounded-lg border border-border/50 bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                  {m.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{m.name}</p>
                    {i === 0 && <Crown className="w-3.5 h-3.5 text-yellow-500" title="Team Lead" />}
                  </div>
                  {m.rollNumber && <p className="text-xs text-muted-foreground">{m.rollNumber}</p>}
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                {m.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {m.phone}</span>}
                {m.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {m.email}</span>}
                {m.githubLink && <a href={m.githubLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary"><Github className="w-3 h-3" /> GitHub</a>}
                {m.linkedinLink && <a href={m.linkedinLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary"><Linkedin className="w-3 h-3" /> LinkedIn</a>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─── Admin view: all teams from Supabase ─── */
const AdminTeamsView: React.FC = () => {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState<any[]>([]);
  const [sectionFilter, setSectionFilter] = useState('all');

  const loadTeams = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('teams')
      .select(`
        id, name, section_id,
        sections(id, name, department),
        projects(id, title, domain, status),
        team_members(student_id, users!inner(id, name, roll_number))
      `)
      .order('name');

    const { data: secs } = await supabase.from('sections').select('id, name, department');
    setSections(secs || []);

    setTeams(
      (data || []).map((t: any) => ({
        id: String(t.id),
        name: t.name,
        section_id: String(t.section_id),
        section_name: t.sections?.name || '—',
        project: t.projects?.[0] || null,
        member_names: (t.team_members || []).map((tm: any) => tm.users?.name).filter(Boolean).join(', '),
        members: (t.team_members || []).map((tm: any) => tm.users).filter(Boolean),
      }))
    );
    setLoading(false);
  };

  useEffect(() => { loadTeams(); }, []);

  const filtered = sectionFilter === 'all' ? teams : teams.filter(t => t.section_id === sectionFilter);

  const handleExport = () => {
    const headers = ['Team', 'Section', 'Members', 'Project', 'Status'];
    const rows = filtered.map(t => [
      `"${t.name}"`, `"${t.section_name}"`, `"${t.member_names}"`,
      `"${t.project?.title || 'N/A'}"`, t.project?.status || 'N/A',
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `teams_export_${Date.now()}.csv`;
    a.click();
    toast({ title: 'Export complete' });
  };

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Teams</h1>
          <p className="text-muted-foreground text-sm mt-1">All project teams</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" /> Export CSV
        </Button>
      </div>

      <div className="flex gap-3">
        <Select value={sectionFilter} onValueChange={setSectionFilter}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Filter by section" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sections</SelectItem>
            {sections.map((s: any) => <SelectItem key={s.id} value={String(s.id)}>{s.name} ({s.department})</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(team => (
          <div key={team.id} className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-shadow animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold">{team.name}</h3>
                  <p className="text-xs text-muted-foreground">{team.section_name}</p>
                </div>
              </div>
              <StatusBadge status={team.project?.status || 'Draft'} />
            </div>
            <div className="p-3 rounded-lg bg-muted/30 border border-border/50 mb-3">
              <p className="text-sm font-medium">{team.project?.title || 'No Project Started'}</p>
              {team.project?.domain && <p className="text-xs text-muted-foreground mt-0.5">{team.project.domain}</p>}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">Members:</span> {team.member_names || '—'}
            </p>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground col-span-2 text-center py-8">No teams found</p>
        )}
      </div>
    </div>
  );
};

/* ─── Mentor view: their section's teams + create ─── */
const MentorTeamsView: React.FC = () => {
  const { user } = useAuth();
  const canCreate = user?.role === 'student_mentor';
  const {
    assignedSections, currentSectionTeams, currentSectionStudents,
    loading, fetchSectionData, createTeam,
  } = useMentor();

  const [selectedSection, setSelectedSection] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  useEffect(() => {
    if (assignedSections.length > 0 && !selectedSection) {
      const first = assignedSections[0].id;
      setSelectedSection(first);
      fetchSectionData(first);
    }
  }, [assignedSections]);

  useEffect(() => {
    if (selectedSection) fetchSectionData(selectedSection);
  }, [selectedSection]);

  const unassigned = currentSectionStudents.filter(s => s.isUnassigned);

  const handleCreate = async () => {
    if (!newTeamName.trim() || selectedStudentIds.length === 0) {
      toast({ title: 'Team name and at least one student are required', variant: 'destructive' }); return;
    }
    const ok = await createTeam(selectedSection, newTeamName, selectedStudentIds);
    if (ok) {
      toast({ title: `Team "${newTeamName}" created` });
      setCreateOpen(false); setNewTeamName(''); setSelectedStudentIds([]);
    } else {
      toast({ title: 'Failed to create team', variant: 'destructive' });
    }
  };

  const handleExport = () => {
    const headers = ['Team', 'Members', 'Project', 'Status'];
    const rows = currentSectionTeams.map(t => [
      `"${t.name}"`, `"${t.member_names}"`, `"${t.project_title || 'N/A'}"`, t.project_status,
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `teams_export_${Date.now()}.csv`;
    a.click();
    toast({ title: 'Export complete' });
  };

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Teams</h1>
          <p className="text-muted-foreground text-sm mt-1">Teams in your assigned section</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} disabled={currentSectionTeams.length === 0}>
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
          {canCreate && (
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="w-4 h-4 mr-2" /> Create Team</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create New Team</DialogTitle></DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Team Name</Label>
                    <Input value={newTeamName} onChange={e => setNewTeamName(e.target.value)} placeholder="e.g. Team Gamma" />
                  </div>
                  {assignedSections.length > 1 && (
                    <div className="space-y-2">
                      <Label>Section</Label>
                      <Select value={selectedSection} onValueChange={setSelectedSection}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {assignedSections.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>Assign Students (unassigned only)</Label>
                    <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto p-2 border rounded-md">
                      {unassigned.map(s => (
                        <div key={s.id} className="flex items-center gap-2">
                          <input type="checkbox" id={`s-${s.id}`}
                            checked={selectedStudentIds.includes(s.id)}
                            onChange={e => setSelectedStudentIds(p => e.target.checked ? [...p, s.id] : p.filter(id => id !== s.id))} />
                          <Label htmlFor={`s-${s.id}`} className="text-xs font-normal cursor-pointer">
                            {s.name} {s.rollNumber ? `(${s.rollNumber})` : `(${s.email?.split('@')[0]})`}
                          </Label>
                        </div>
                      ))}
                      {unassigned.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No unassigned students</p>}
                    </div>
                  </div>
                  <Button className="w-full" onClick={handleCreate}>Create Team</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {assignedSections.length > 1 && (
        <Select value={selectedSection} onValueChange={setSelectedSection}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Switch Section" /></SelectTrigger>
          <SelectContent>
            {assignedSections.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentSectionTeams.map(team => (
          <div key={team.id} className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-shadow animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold">{team.name}</h3>
                  <p className="text-xs text-muted-foreground">{team.member_names || '—'}</p>
                </div>
              </div>
              <StatusBadge status={team.project_status || 'Draft'} />
            </div>
            <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
              <p className="text-sm font-medium">{team.project_title || 'No Project Started'}</p>
            </div>
          </div>
        ))}
        {currentSectionTeams.length === 0 && (
          <div className="col-span-2 rounded-xl border border-dashed border-border p-10 text-center">
            <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {assignedSections.length === 0 ? 'No sections assigned yet' : 'No teams in this section yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Main router ─── */
const Teams: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;
  if (user.role === 'student') return <StudentTeamView />;
  if (user.role === 'admin') return <AdminTeamsView />;
  return <MentorTeamsView />;
};

export default Teams;
