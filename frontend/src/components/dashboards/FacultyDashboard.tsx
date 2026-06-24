import React, { useEffect, useState } from 'react';
import StatCard from '@/components/StatCard';
import StatusBadge from '@/components/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Layers, FileCheck, Clock, CheckCircle, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMentor } from '@/hooks/useMentor';

const FacultyDashboard: React.FC = () => {
  const { user } = useAuth();
  const { assignedSections, currentSectionTeams, loading, fetchSectionData } = useMentor();
  const [todaysClasses, setTodaysClasses] = useState<any[]>([]);

  useEffect(() => {
    if (assignedSections.length > 0) fetchSectionData(assignedSections[0].id);
  }, [assignedSections]);

  useEffect(() => {
    if (!user) return;
    const today = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
    supabase
      .from('timetable')
      .select('id, day_of_week, start_time, end_time, room_number, subject, sections(name)')
      .eq('faculty_id', Number(user.id))
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

  const pendingReviews = currentSectionTeams.filter(t => t.project_status === 'Faculty Review').length;
  const approved = currentSectionTeams.filter(t => ['Approved', 'Completed'].includes(t.project_status)).length;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold">Faculty Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Welcome back, {user?.name}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Assigned Sections" value={assignedSections.length} icon={<Layers className="w-5 h-5" />} variant="blue" />
            <StatCard title="Total Teams" value={currentSectionTeams.length} icon={<FileCheck className="w-5 h-5" />} variant="green" />
            <StatCard title="Pending Reviews" value={pendingReviews} icon={<Clock className="w-5 h-5" />} variant="red" />
            <StatCard title="Approved" value={approved} icon={<CheckCircle className="w-5 h-5" />} variant="green" />
          </div>

          <div className="glass-card rounded-xl p-6 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
            <h3 className="font-heading font-semibold mb-4 text-white">Projects Pending Review</h3>
            {loading ? (
              <p className="text-sm text-muted-foreground text-center py-6">Loading projects...</p>
            ) : currentSectionTeams.filter(t => t.project_status === 'Faculty Review').length > 0 ? (
              <div className="space-y-3">
                {currentSectionTeams.filter(t => t.project_status === 'Faculty Review').map(t => (
                  <div key={t.id} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-primary/20 transition-all duration-200">
                    <div>
                      <p className="font-medium text-white">{t.project_title || 'Untitled Project'}</p>
                      <p className="text-xs text-muted-foreground mt-1">Team: {t.name}</p>
                    </div>
                    <StatusBadge status={t.project_status} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                {assignedSections.length === 0 ? 'No sections assigned yet' : 'No pending reviews'}
              </p>
            )}
          </div>
        </div>

        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 backdrop-blur-xl">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;
