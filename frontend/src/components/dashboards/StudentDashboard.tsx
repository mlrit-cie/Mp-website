import React, { useEffect } from 'react';
import StatCard from '@/components/StatCard';
import StatusBadge from '@/components/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { useProjects } from '@/hooks/useProjects';
import { FolderKanban, FileCheck, Clock, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { projects, loading, fetchProjects } = useProjects();

  useEffect(() => { fetchProjects(); }, []);

  const project = projects[0] || null;

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
          title="Project Status"
          value={project?.status || 'No Project'}
          icon={<FolderKanban className="w-5 h-5" />}
          variant="green"
        />
        <StatCard
          title="Team"
          value={project?.team_name || '—'}
          icon={<FileCheck className="w-5 h-5" />}
          variant="blue"
        />
        <StatCard
          title="Checklist"
          value={`${completedItems} / ${checklist.length}`}
          icon={<Clock className="w-5 h-5" />}
          variant={completedItems === checklist.length && checklist.length > 0 ? 'green' : 'red'}
        />
        <StatCard
          title="Section"
          value={project?.section_name || '—'}
          icon={<FileCheck className="w-5 h-5" />}
          variant="green"
        />
      </div>

      {loading && (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Loading your project data...
        </div>
      )}

      {!loading && project && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Project card */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-semibold">My Project</h3>
              <StatusBadge status={project.status} />
            </div>
            <h4 className="text-lg font-medium">{project.title || 'Untitled Project'}</h4>
            <p className="text-sm text-muted-foreground mt-1">Domain: {project.domain || '—'}</p>
            {project.abstract && (
              <p className="mt-3 text-sm text-muted-foreground line-clamp-3">{project.abstract}</p>
            )}
            {project.feedback && (
              <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
                <p className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-1">Mentor Feedback</p>
                <p className="text-sm">{project.feedback}</p>
              </div>
            )}
            <Link to="/projects" className="mt-4 flex items-center gap-1 text-sm text-primary hover:underline">
              View full project <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Submission checklist */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-heading font-semibold mb-4">Submission Checklist</h3>
            <div className="space-y-3">
              {checklist.map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${item.done ? 'bg-green-500 border-green-500' : 'border-border'}`} />
                  <span className={`text-sm ${item.done ? 'text-foreground' : 'text-muted-foreground'}`}>{item.label}</span>
                  {item.done && <span className="ml-auto text-xs text-green-600 font-medium">Done</span>}
                </div>
              ))}
            </div>
            {completedItems < checklist.length && (
              <Link to="/projects" className="mt-5 block w-full text-center py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
                Complete Submission
              </Link>
            )}
          </div>
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
