import React from 'react';
import StatCard from '@/components/StatCard';
import { Users, Layers, FileCheck, Megaphone, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useAdmin } from '@/hooks/useAdmin';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { ProjectStatus } from '@/lib/types';

const statusColors: Record<ProjectStatus, string> = {
  'Draft': 'hsl(0, 0%, 60%)',
  'Student Mentor Review': 'hsl(38, 92%, 50%)',
  'Faculty Review': 'hsl(215, 80%, 50%)',
  'Approved': 'hsl(145, 63%, 42%)',
  'Submitted to CIE': 'hsl(280, 60%, 50%)',
  'Completed': 'hsl(145, 63%, 32%)',
};

const AdminDashboard: React.FC = () => {
  const { stats, sectionProjectData, loading } = useAdmin();
  const { announcements, loading: annLoading } = useAnnouncements();

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-heading font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">System Overview & Management</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Students" value={stats?.studentCount ?? 0} subtitle="Enrolled" icon={<Users className="w-5 h-5" />} variant="blue" />
        <StatCard title="Sections" value={stats?.sectionCount ?? 0} subtitle="Active" icon={<Layers className="w-5 h-5" />} variant="green" />
        <StatCard title="Projects" value={stats?.projectCount ?? 0} subtitle="Current Year" icon={<FileCheck className="w-5 h-5" />} variant="green" />
        <StatCard title="Mentors" value={stats?.mentorCount ?? 0} subtitle="Faculty & Student" icon={<Users className="w-5 h-5" />} variant="red" />
      </div>

      {/* Section-wise project status chart */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-heading font-semibold mb-4">Section-wise Project Status</h3>
        {sectionProjectData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sectionProjectData}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {Object.entries(statusColors).map(([status, color]) => (
                <Bar key={status} dataKey={status} stackId="a" fill={color} radius={0} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">No project data yet</p>
        )}
      </div>

      {/* Recent announcements */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Megaphone className="w-4 h-4 text-primary" />
          <h3 className="font-heading font-semibold">Recent Announcements</h3>
        </div>
        {annLoading ? (
          <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
        ) : announcements.length > 0 ? (
          <div className="space-y-3">
            {announcements.slice(0, 5).map(a => (
              <div key={a.id} className="p-3 rounded-lg bg-muted/50 border border-border/50">
                <p className="text-sm font-medium">{a.title}</p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.content}</p>
                <p className="text-[10px] text-muted-foreground mt-2">
                  {new Date(a.created_at).toLocaleDateString('en-GB')} — {a.author}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-6">No announcements yet</p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
