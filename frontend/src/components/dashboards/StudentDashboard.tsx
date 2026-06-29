import React, { useEffect, useState } from 'react';
import StatCard from '@/components/StatCard';
import StatusBadge from '@/components/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { useProjects } from '@/hooks/useProjects';
import { supabase } from '@/lib/supabase';
import { FolderKanban, FileCheck, Clock, ChevronRight, Users as UsersIcon, CalendarClock, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PremiumCard } from '@/components/ui/premium-card';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { projects, loading, fetchProjects } = useProjects();
  const [teammates, setTeammates] = useState<{ id: number; name: string; roll: string | null }[]>([]);

  useEffect(() => { fetchProjects(); }, []);

  const project = projects[0] || null;

  // Pull teammates for the current project's team
  useEffect(() => {
    if (!project?.team_id) { setTeammates([]); return; }
    supabase
      .from('team_members')
      .select('student_id, users!inner(id, name, roll_number)')
      .eq('team_id', Number(project.team_id))
      .then(({ data }) => {
        setTeammates(
          (data || []).map((r: any) => ({
            id: r.users.id, name: r.users.name, roll: r.users.roll_number ?? null,
          }))
        );
      });
  }, [project?.team_id]);

  const deadline: Date | null = project?.deadline ? new Date(project.deadline) : null;
  const daysUntilDeadline = deadline
    ? Math.ceil((deadline.getTime() - Date.now()) / (24 * 60 * 60 * 1000))
    : null;

  const checklist = project ? [
    { label: 'Title & Domain', done: !!project.title && !!project.domain && project.domain !== 'Pending Selection' },
    { label: 'Abstract', done: !!project.abstract },
    { label: 'GitHub Link', done: !!project.github_link },
    { label: 'Video Link', done: !!project.video_link },
  ] : [];

  const completedItems = checklist.filter(c => c.done).length;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold">Team Portal</h1>
        <p className="text-muted-foreground text-sm mt-1">Welcome back, {user?.name}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          index={0}
          title="Project Status"
          value={project?.status || 'No Project'}
          icon={<FolderKanban className="w-5 h-5" />}
          variant="green"
        />
        <StatCard
          index={1}
          title="Team"
          value={project?.team_name || '—'}
          icon={<FileCheck className="w-5 h-5" />}
          variant="blue"
        />
        <StatCard
          index={2}
          title="Submission"
          value={`${completedItems} / ${checklist.length}`}
          subtitle="checklist items"
          icon={<Clock className="w-5 h-5" />}
          variant={completedItems === checklist.length && checklist.length > 0 ? 'green' : 'red'}
        />
        <StatCard
          index={3}
          title="Deadline"
          value={deadline ? deadline.toLocaleDateString('en-GB') : '—'}
          subtitle={
            daysUntilDeadline === null
              ? 'not set'
              : daysUntilDeadline < 0
                ? `${Math.abs(daysUntilDeadline)} days overdue`
                : daysUntilDeadline === 0
                  ? 'today'
                  : `${daysUntilDeadline} days left`
          }
          icon={<CalendarClock className="w-5 h-5" />}
          variant={daysUntilDeadline !== null && daysUntilDeadline <= 3 ? 'red' : 'blue'}
        />
      </div>

      {loading && (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Loading your project data...
        </div>
      )}

      {!loading && project && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Team details */}
          <PremiumCard index={0} interactive="subtle" className="p-6 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-2 mb-4">
              <UsersIcon className="w-4 h-4 text-primary" />
              <h3 className="font-heading font-semibold">Team {project.team_name}</h3>
              <span className="ml-auto text-xs text-muted-foreground">{project.section_name}</span>
            </div>
            {teammates.length > 0 ? (
              <ul className="space-y-2">
                {teammates.map(m => (
                  <li key={m.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-primary/20 transition-all duration-200">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold border border-primary/20">
                      {m.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{m.name}{Number(user?.id) === m.id ? ' (you)' : ''}</p>
                      {m.roll && <p className="text-[10px] text-muted-foreground font-mono">{m.roll}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No teammates loaded yet</p>
            )}
          </PremiumCard>

          {/* Project card */}
          <PremiumCard index={1} interactive="subtle" className="p-6 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-semibold">My Project</h3>
              <StatusBadge status={project.status} />
            </div>
            <h4 className="text-lg font-medium">{project.title || 'Untitled Project'}</h4>
            <p className="text-sm text-muted-foreground mt-1">Domain: {project.domain || '—'}</p>
            {project.abstract && (
              <p className="mt-3 text-sm text-muted-foreground line-clamp-3 leading-relaxed">{project.abstract}</p>
            )}
            <Link to="/projects" className="mt-4 inline-flex items-center gap-1 text-sm text-primary hover:underline font-medium">
              View full project <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </PremiumCard>

          {/* Mentor feedback (full-width when present) */}
          {project.feedback && (
            <PremiumCard index={2} interactive="subtle" className="lg:col-span-2 bg-gradient-card-blue border-blue-500/20 p-6 relative overflow-hidden">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4 text-secondary" />
                <h3 className="font-heading font-semibold text-secondary">Mentor Feedback</h3>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{project.feedback}</p>
            </PremiumCard>
          )}

          {/* Submission checklist */}
          <PremiumCard index={3} interactive="subtle" className="p-6">
            <h3 className="font-heading font-semibold mb-4">Submission Checklist</h3>
            <div className="space-y-3">
              {checklist.map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${item.done ? 'bg-green-500 border-green-500' : 'border-white/20'}`}>
                    {item.done && <span className="text-[8px] text-white">✓</span>}
                  </div>
                  <span className={`text-sm ${item.done ? 'text-foreground' : 'text-muted-foreground'}`}>{item.label}</span>
                  {item.done && <span className="ml-auto text-xs text-green-400 font-medium">Done</span>}
                </div>
              ))}
            </div>
            {completedItems < checklist.length && (
              <Link to="/projects" className="mt-5 block w-full text-center py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-emerald-500/10 active:scale-[0.98] transition-all duration-200">
                Complete Submission
              </Link>
            )}
          </PremiumCard>
        </div>
      )}

      {!loading && !project && (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <FolderKanban className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-sm">No project assigned yet</p>
          <p className="text-xs text-muted-foreground mt-1">Your mentor will create a team and assign you to a project.</p>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
