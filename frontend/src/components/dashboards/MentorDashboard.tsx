import React, { useEffect, useState } from 'react';
import StatCard from '@/components/StatCard';
import StatusBadge from '@/components/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { FolderKanban, FileCheck, Clock, Users, Calendar, Layers, Megaphone, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMentor } from '@/hooks/useMentor';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { PremiumCard } from '@/components/ui/premium-card';

const MentorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { assignedSections, currentSectionTeams, loading, fetchSectionData } = useMentor();
  const { announcements } = useAnnouncements();
  const [todaysClasses, setTodaysClasses] = useState<any[]>([]);
  const [recentUpdates, setRecentUpdates] = useState<any[]>([]);

  // Recent project updates within the past 7 days (teams in any assigned section)
  useEffect(() => {
    if (assignedSections.length === 0) { setRecentUpdates([]); return; }
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const sectionIds = assignedSections.map(s => Number(s.id));
    supabase
      .from('projects')
      .select('id, title, status, updated_at, team_id, teams!inner(name, section_id)')
      .gte('updated_at', sevenDaysAgo)
      .in('teams.section_id', sectionIds)
      .order('updated_at', { ascending: false })
      .limit(8)
      .then(({ data }) => {
        setRecentUpdates(
          (data || []).map((p: any) => ({
            id: p.id, title: p.title || 'Untitled', status: p.status,
            teamName: p.teams?.name || '—', updatedAt: p.updated_at,
          }))
        );
      });
  }, [assignedSections]);

  useEffect(() => {
    if (assignedSections.length > 0) fetchSectionData(assignedSections[0].id);
  }, [assignedSections]);

  useEffect(() => {
    if (!user) return;
    const today = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
    supabase
      .from('timetable')
      .select('id, day_of_week, start_time, end_time, room_number, student_mentor_ids, sections(name)')
      .contains('student_mentor_ids', [Number(user.id)])
      .eq('day_of_week', today)
      .order('start_time')
      .then(({ data }) => {
        setTodaysClasses(
          (data || []).map((e: any) => ({
            id: e.id, startTime: e.start_time?.slice(0, 5), endTime: e.end_time?.slice(0, 5),
            room: e.room_number, sectionName: e.sections?.name || '—',
          }))
        );
      });
  }, [user]);

  const pendingReviews = currentSectionTeams.filter(t => t.project_status === 'Student Mentor Review').length;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold">Student Mentor Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Welcome back, {user?.name}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard index={0} title="My Teams" value={currentSectionTeams.length} icon={<FolderKanban className="w-5 h-5" />} variant="green" />
            <StatCard index={1} title="Assigned Sections" value={assignedSections.length} icon={<Users className="w-5 h-5" />} variant="blue" />
            <StatCard index={2} title="Pending Reviews" value={pendingReviews} icon={<Clock className="w-5 h-5" />} variant="red" />
            <StatCard index={3} title="Section" value={assignedSections[0]?.name || '—'} icon={<FileCheck className="w-5 h-5" />} variant="green" />
          </div>

          {/* Assigned sections list */}
          <PremiumCard index={0} interactive="subtle" className="p-6 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-2 mb-4">
              <Layers className="w-4 h-4 text-primary" />
              <h3 className="font-heading font-semibold text-white">My Sections</h3>
            </div>
            {assignedSections.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {assignedSections.map(s => (
                  <button
                    key={s.id}
                    onClick={() => fetchSectionData(s.id)}
                    className="text-left p-3.5 rounded-xl border border-white/5 bg-white/[0.01] hover:border-primary/40 hover:bg-primary/5 transition-all duration-200"
                  >
                    <p className="font-medium text-sm text-white">{s.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {s.department}{s.academicYear ? ` • ${s.academicYear}` : ''}
                      {typeof s.studentCount === 'number' ? ` • ${s.studentCount} students` : ''}
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">No sections assigned to you yet</p>
            )}
          </PremiumCard>

          {/* Weekly updates: recent project changes + recent announcements */}
          <PremiumCard index={1} interactive="subtle" className="p-6 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-primary" />
              <h3 className="font-heading font-semibold text-white">This Week</h3>
              <span className="ml-auto text-[10px] text-muted-foreground">past 7 days</span>
            </div>
            {recentUpdates.length === 0 && announcements.slice(0, 3).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No updates this week</p>
            ) : (
              <div className="space-y-3">
                {recentUpdates.map(u => (
                  <div key={`proj-${u.id}`} className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-primary/20 transition-all duration-200">
                    <FolderKanban className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium truncate text-white">{u.title}</p>
                        <StatusBadge status={u.status} />
                      </div>
                      <p className="text-xs text-muted-foreground">{u.teamName} • {new Date(u.updatedAt).toLocaleDateString('en-GB')}</p>
                    </div>
                  </div>
                ))}
                {announcements.slice(0, 3).map(a => (
                  <div key={`ann-${a.id}`} className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-primary/20 transition-all duration-200">
                    <Megaphone className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate text-white">{a.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{a.content}</p>
                      <p className="text-[10px] text-muted-foreground mt-1 font-mono">
                        {new Date(a.created_at).toLocaleDateString('en-GB')} — {a.author}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </PremiumCard>

          <PremiumCard index={2} interactive="subtle" className="p-6">
            <h3 className="font-heading font-semibold mb-4 text-white">Teams Overview</h3>
            {loading ? (
              <p className="text-sm text-muted-foreground text-center py-6">Loading teams...</p>
            ) : currentSectionTeams.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentSectionTeams.map(t => (
                  <div key={t.id} className="p-4 rounded-xl border border-white/5 bg-white/[0.01] hover:border-primary/20 transition-all duration-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-white">{t.name}</p>
                      <StatusBadge status={t.project_status || 'Draft'} />
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{t.member_names || '—'}</p>
                    <p className="text-sm mt-2 text-foreground/80 line-clamp-1">{t.project_title || 'No project yet'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                {assignedSections.length === 0 ? 'No sections assigned yet' : 'No teams in your section yet'}
              </p>
            )}
          </PremiumCard>
        </div>

        <div className="lg:col-span-1 space-y-4">
          <PremiumCard index={3} interactive="subtle" className="border-primary/20 bg-primary/5 p-5">
            <h3 className="text-sm font-heading font-bold text-primary flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4" /> Today's Schedule
            </h3>
            {todaysClasses.length > 0 ? (
              <div className="space-y-3">
                {todaysClasses.map(e => (
                  <div key={e.id} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-primary/20 transition-all duration-200 shadow-sm">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] font-bold text-primary font-mono">{e.startTime} – {e.endTime}</span>
                      <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono uppercase font-bold border border-primary/20">{e.room}</span>
                    </div>
                    <p className="text-xs font-semibold truncate text-white">{e.sectionName}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic py-4 text-center">No classes today</p>
            )}
            <Link to="/timetable" className="block text-center text-[10px] font-bold text-primary mt-4 hover:underline">
              View Full Timetable
            </Link>
          </PremiumCard>
        </div>
      </div>
    </div>
  );
};

export default MentorDashboard;
