import React, { useState, useEffect } from 'react';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Github, Video, Save, ChevronRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useProjects } from '@/hooks/useProjects';
import { toast } from '@/hooks/use-toast';

const NEXT_STATUS: Record<string, Record<string, string>> = {
  student: { 'Draft': 'Student Mentor Review' },
  student_mentor: { 'Student Mentor Review': 'Faculty Review' },
  faculty: { 'Faculty Review': 'Approved', 'Approved': 'Submitted to CIE' },
  admin: { 'Submitted to CIE': 'Completed' }
};

const domains = ['Web Development', 'App Development', 'Automation', 'Artificial Intelligence', 'IoT', 'Drone Technology', 'Robotics', 'Chatbots'];

const isValidDomain = (d: string) => d && d !== 'Pending Selection';

const Projects: React.FC = () => {
  const { user } = useAuth();
  const { projects, loading, fetchProjects, updateProject } = useProjects();
  const isAdmin = user?.role === 'admin';
  const isMentor = user?.role === 'student_mentor' || user?.role === 'faculty';
  const isStudent = user?.role === 'student';

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: '', domain: '', abstract: '', github_link: '', video_link: '' });
  const [feedbackMap, setFeedbackMap] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchProjects(); }, []);

  const startEdit = (p: any) => {
    setEditingId(p.id);
    setEditForm({ title: p.title, domain: p.domain || '', abstract: p.abstract || '', github_link: p.github_link || '', video_link: p.video_link || '' });
  };

  const saveEdit = async (projectId: string) => {
    setSaving(true);
    const ok = await updateProject(projectId, editForm);
    setSaving(false);
    if (ok) { toast({ title: 'Project updated' }); setEditingId(null); }
    else toast({ title: 'Error saving', variant: 'destructive' });
  };

  const advanceStatus = async (project: any) => {
    const role = user?.role || '';
    const next = NEXT_STATUS[role]?.[project.status];
    if (!next) return;
    const payload: any = { status: next };
    if (feedbackMap[project.id]) payload.feedback = feedbackMap[project.id];
    const ok = await updateProject(project.id, payload);
    if (ok) toast({ title: `Status → ${next}` });
    else toast({ title: 'Update failed', variant: 'destructive' });
  };

  const handleExport = () => {
    const headers = ['ID', 'Title', 'Domain', 'Status', 'Team', 'Section'];
    const csvData = projects.map(p => [
      p.id, `"${(p.title || '').replace(/"/g, '""')}"`, p.domain, p.status, p.team_name, p.section_name
    ]);
    const csv = [headers, ...csvData].map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'projects_export.csv';
    a.click();
    toast({ title: 'Export complete' });
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  // ── Student view: single project card ──
  if (isStudent && projects.length > 0) {
    const project = projects[0];
    const isEditing = editingId === project.id;
    const nextStatus = NEXT_STATUS['student']?.[project.status];

    const checklist = [
      { label: 'Title & Domain', done: !!project.title && isValidDomain(project.domain) },
      { label: 'Abstract', done: !!project.abstract },
      { label: 'GitHub Link', done: !!project.github_link },
      { label: 'Video Link', done: !!project.video_link },
    ];

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold">My Project</h1>
          <p className="text-muted-foreground text-sm mt-1">Your project details and submission status</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-heading font-semibold">{project.title || 'Untitled Project'}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Team: {project.team_name}</p>
            </div>
            <StatusBadge status={project.status} />
          </div>

          {isEditing ? (
            <div className="space-y-3 p-4 rounded-lg bg-muted/20 border border-border">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Project Title</Label>
                  <Input value={editForm.title} onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Domain</Label>
                  <Select value={editForm.domain} onValueChange={v => setEditForm(p => ({ ...p, domain: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select domain" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending Selection">— Select Domain —</SelectItem>
                      {domains.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Abstract</Label>
                <textarea
                  className="w-full text-sm rounded-md border border-border bg-background p-2 min-h-[80px] resize-y"
                  value={editForm.abstract}
                  onChange={e => setEditForm(p => ({ ...p, abstract: e.target.value }))}
                  placeholder="Describe your project..."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">GitHub Link</Label>
                  <Input value={editForm.github_link} onChange={e => setEditForm(p => ({ ...p, github_link: e.target.value }))} placeholder="https://github.com/..." />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Video Link</Label>
                  <Input value={editForm.video_link} onChange={e => setEditForm(p => ({ ...p, video_link: e.target.value }))} placeholder="https://youtube.com/..." />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => setEditingId(null)}>Cancel</Button>
                <Button size="sm" onClick={() => saveEdit(project.id)} disabled={saving}>
                  {saving ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1.5" />}
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-muted-foreground">Domain:</span> <span className="font-medium">{project.domain || '—'}</span></div>
                <div><span className="text-muted-foreground">Section:</span> <span className="font-medium">{project.section_name || '—'}</span></div>
              </div>
              {project.abstract && <p className="text-sm text-muted-foreground">{project.abstract}</p>}
              <div className="flex flex-col gap-1.5 text-sm">
                {project.github_link && <a href={project.github_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline"><Github className="w-4 h-4" /> {project.github_link}</a>}
                {project.video_link && <a href={project.video_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline"><Video className="w-4 h-4" /> {project.video_link}</a>}
              </div>
              {project.feedback && (
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
                  <p className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-1">Mentor Feedback</p>
                  <p className="text-sm">{project.feedback}</p>
                </div>
              )}
              <Button variant="outline" size="sm" onClick={() => startEdit(project)}>Edit Details</Button>
            </div>
          )}

          {/* Checklist */}
          <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
            <p className="text-xs font-medium text-muted-foreground mb-3">Submission Checklist</p>
            <div className="grid grid-cols-2 gap-2">
              {checklist.map(item => (
                <div key={item.label} className="flex items-center gap-2 text-sm">
                  <div className={`w-3 h-3 rounded-full border-2 ${item.done ? 'bg-green-500 border-green-500' : 'border-border'}`} />
                  <span className={item.done ? 'text-foreground' : 'text-muted-foreground'}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Submit button */}
          {nextStatus && project.status === 'Draft' && (
            <Button className="w-full" onClick={() => advanceStatus(project)}>
              Submit for Mentor Review <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  // ── Mentor / Admin / Faculty table view ──
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Projects</h1>
          <p className="text-muted-foreground text-sm mt-1">Track and manage all micro projects</p>
        </div>
        {isAdmin && (
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-left p-4 font-medium text-muted-foreground">Team / Project</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Domain</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Section</th>
                {(isMentor || isAdmin) && <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {projects.map(project => {
                const role = user?.role || '';
                const nextStatus = NEXT_STATUS[role]?.[project.status];
                return (
                  <tr key={project.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="p-4">
                      <p className="font-medium">{project.title || 'Untitled'}</p>
                      <p className="text-xs text-muted-foreground">{project.team_name}</p>
                    </td>
                    <td className="p-4 text-muted-foreground">{project.domain || '—'}</td>
                    <td className="p-4"><StatusBadge status={project.status} /></td>
                    <td className="p-4 text-muted-foreground">{project.section_name || '—'}</td>
                    {(isMentor || isAdmin) && (
                      <td className="p-4">
                        <div className="space-y-2">
                          {nextStatus && (
                            <>
                              <Input
                                placeholder="Leave feedback (optional)"
                                className="h-7 text-xs w-48"
                                value={feedbackMap[project.id] || ''}
                                onChange={e => setFeedbackMap(m => ({ ...m, [project.id]: e.target.value }))}
                              />
                              <Button size="sm" className="h-7 text-xs" onClick={() => advanceStatus(project)}>
                                → {nextStatus}
                              </Button>
                            </>
                          )}
                          {!nextStatus && <span className="text-xs text-muted-foreground">No action needed</span>}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
              {projects.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No projects found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Projects;
