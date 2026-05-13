import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Github, Users, Loader2 } from 'lucide-react';

const ArchivePage: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [yearFilter, setYearFilter] = useState('all');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('projects')
        .select(`
          id, title, domain, github_link, status, updated_at, section_id,
          teams!inner(id, name,
            sections(id, name, academic_year, department),
            team_members(student_id, users!inner(id, name, roll_number, department))
          )
        `)
        .in('status', ['Approved', 'Submitted to CIE', 'Completed'])
        .order('updated_at', { ascending: false });

      setProjects(
        (data || []).map((p: any) => ({
          id: p.id,
          title: p.title,
          domain: p.domain,
          github_link: p.github_link,
          status: p.status,
          academicYear: p.teams?.sections?.academic_year || '2024-25',
          sectionName: p.teams?.sections?.name || '—',
          teamName: p.teams?.name || '—',
          members: (p.teams?.team_members || []).map((tm: any) => tm.users).filter(Boolean),
        }))
      );
      setLoading(false);
    };
    load();
  }, []);

  const years = [...new Set(projects.map(p => p.academicYear))].filter(Boolean);

  const filtered = projects.filter(p => {
    const matchSearch = !search ||
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.domain?.toLowerCase().includes(search.toLowerCase()) ||
      p.teamName?.toLowerCase().includes(search.toLowerCase());
    const matchYear = yearFilter === 'all' || p.academicYear === yearFilter;
    return matchSearch && matchYear;
  });

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Project Archive</h1>
        <p className="text-muted-foreground text-sm mt-1">Browse approved and completed projects</p>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by title, domain, or team..." className="pl-9"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={yearFilter} onValueChange={setYearFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Year" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {filtered.map(p => (
          <div key={p.id} className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-shadow animate-fade-in">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-heading font-semibold">{p.title}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {p.domain} • {p.academicYear} • {p.sectionName}
                </p>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 font-medium">
                {p.status}
              </span>
            </div>

            {p.github_link && (
              <a href={p.github_link} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline mb-3">
                <Github className="w-3.5 h-3.5" /> {p.github_link}
              </a>
            )}

            <div className="p-3 rounded-lg bg-muted/20 border border-border/50">
              <div className="flex items-center gap-1.5 mb-2">
                <Users className="w-3.5 h-3.5 text-muted-foreground" />
                <p className="text-xs font-medium text-muted-foreground">{p.teamName}</p>
              </div>
              {p.members.length > 0 && (
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  {p.members.map((m: any) => (
                    <span key={m.id}>
                      {m.name}{m.roll_number ? ` (${m.roll_number})` : ''}{m.department ? ` • ${m.department}` : ''}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed rounded-xl border-border/50">
            <p className="text-sm text-muted-foreground">No approved projects found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArchivePage;
