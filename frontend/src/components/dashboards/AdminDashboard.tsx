import React from 'react';
import StatCard from '@/components/StatCard';
import { Users, Layers, FileCheck, Megaphone, Loader2, AlertTriangle, Sparkles, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { useAdmin } from '@/hooks/useAdmin';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { ProjectStatus } from '@/lib/types';

const DOMAIN_COLORS = [
  'hsl(215, 80%, 55%)', 'hsl(145, 63%, 45%)', 'hsl(280, 60%, 55%)', 'hsl(38, 92%, 55%)',
  'hsl(0, 75%, 55%)',   'hsl(190, 80%, 45%)', 'hsl(330, 70%, 55%)', 'hsl(50, 90%, 50%)',
  'hsl(160, 50%, 45%)', 'hsl(20, 80%, 55%)',
];

const statusColors: Record<ProjectStatus, string> = {
  'Draft': 'hsl(0, 0%, 60%)',
  'Student Mentor Review': 'hsl(38, 92%, 50%)',
  'Faculty Review': 'hsl(215, 80%, 50%)',
  'Approved': 'hsl(145, 63%, 42%)',
  'Submitted to CIE': 'hsl(280, 60%, 50%)',
  'Completed': 'hsl(145, 63%, 32%)',
};

const AdminDashboard: React.FC = () => {
  const { stats, sectionProjectData, domainPopularity, mentorWorkload, loading } = useAdmin();
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Total Students" value={stats?.studentCount ?? 0} subtitle="Enrolled" icon={<Users className="w-5 h-5" />} variant="blue" />
        <StatCard title="Sections" value={stats?.sectionCount ?? 0} subtitle="Active" icon={<Layers className="w-5 h-5" />} variant="green" />
        <StatCard title="Projects" value={stats?.projectCount ?? 0} subtitle="Current Year" icon={<FileCheck className="w-5 h-5" />} variant="green" />
        <StatCard title="Mentors" value={stats?.mentorCount ?? 0} subtitle="Faculty & Student" icon={<Users className="w-5 h-5" />} variant="red" />
        <StatCard title="Pending Approvals" value={stats?.pendingApprovals ?? 0} subtitle="Awaiting review" icon={<AlertTriangle className="w-5 h-5" />} variant="red" />
      </div>

      {/* Section-wise project status chart */}
      <div className="glass-card rounded-xl p-6 relative overflow-hidden">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
        <h3 className="font-heading font-semibold mb-4 text-white">Section-wise Project Status</h3>
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

      {/* Domain popularity + Mentor workload */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Domain popularity */}
        <div className="glass-card rounded-xl p-6 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <h3 className="font-heading font-semibold text-white">Domain Popularity</h3>
          </div>
          {domainPopularity.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={domainPopularity}
                  dataKey="count"
                  nameKey="domain"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={45}
                  label={(e: any) => `${e.domain} (${e.count})`}
                  labelLine={false}
                >
                  {domainPopularity.map((_, i) => (
                    <Cell key={i} fill={DOMAIN_COLORS[i % DOMAIN_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No project domains yet</p>
          )}
        </div>

        {/* Mentor workload */}
        <div className="glass-card rounded-xl p-6 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-primary" />
            <h3 className="font-heading font-semibold text-white">Mentor Workload</h3>
            <span className="ml-auto text-[10px] text-muted-foreground">top 10</span>
          </div>
          {mentorWorkload.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={mentorWorkload} layout="vertical" margin={{ left: 12 }}>
                <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis dataKey="mentor" type="category" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={110} />
                <Tooltip />
                <Bar dataKey="projects" fill="hsl(225, 73%, 57%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No assigned projects yet</p>
          )}
        </div>
      </div>

      {/* Recent announcements */}
      <div className="glass-card rounded-xl p-6 relative overflow-hidden">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center gap-2 mb-4">
          <Megaphone className="w-4 h-4 text-primary" />
          <h3 className="font-heading font-semibold text-white">Recent Announcements</h3>
        </div>
        {annLoading ? (
          <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
        ) : announcements.length > 0 ? (
          <div className="space-y-3">
            {announcements.slice(0, 5).map(a => (
              <div key={a.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-primary/20 transition-all duration-200">
                <p className="text-sm font-medium text-white">{a.title}</p>
                <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">{a.content}</p>
                <p className="text-[10px] text-muted-foreground mt-2 font-mono">
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
