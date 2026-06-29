import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import AppSidebar from '@/components/AppSidebar';
import { PremiumCard } from '@/components/ui/premium-card';
import {
  Search, Github, Users, Loader2, ChevronLeft, ChevronRight,
  Archive as ArchiveIcon, LogIn, Layers, Sparkles, ArrowUpDown,
} from 'lucide-react';

const PAGE_SIZE = 12;

interface ArchiveProject {
  id: number;
  title: string;
  domain: string | null;
  abstract: string | null;
  github_link: string | null;
  status: string;
  academicYear: string;
  sectionName: string;
  teamName: string;
  members: { id: string; name: string; roll_number: string | null; department: string | null }[];
  updatedAt: string;
}

const statusStyle = (s: string) => {
  if (s === 'Completed')        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400';
  if (s === 'Submitted to CIE') return 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400';
  return 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400';
};

const ArchivePage: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ArchiveProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [yearFilter, setYearFilter] = useState('all');
  const [domainFilter, setDomainFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');
  const [page, setPage] = useState(1);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => { setPage(1); }, [search, yearFilter, domainFilter, sortBy]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await supabase.rpc('get_archived_projects');
      setProjects(
        (data || []).map((p: any) => ({
          id: p.id,
          title: p.title || 'Untitled',
          domain: p.domain,
          abstract: p.abstract,
          github_link: p.github_link,
          status: p.status,
          academicYear: p.academic_year || '—',
          sectionName: p.section_name || '—',
          teamName: p.team_name || '—',
          updatedAt: p.updated_at,
          members: (p.members || []).map((m: any) => ({
            id: `${m.roll_number || m.name}`,
            name: m.name,
            roll_number: m.roll_number,
            department: m.department,
          })),
        }))
      );
      setLoading(false);
    };
    load();
  }, []);

  const years = useMemo(
    () => [...new Set(projects.map(p => p.academicYear))].filter(Boolean).sort().reverse(),
    [projects],
  );
  const domains = useMemo(
    () => [...new Set(projects.map(p => p.domain).filter((d): d is string => !!d))].sort(),
    [projects],
  );

  const filtered = useMemo(() => {
    let list = projects.filter(p => {
      const q = search.toLowerCase().trim();
      const matchSearch = !q
        || p.title.toLowerCase().includes(q)
        || (p.domain || '').toLowerCase().includes(q)
        || p.teamName.toLowerCase().includes(q)
        || p.sectionName.toLowerCase().includes(q)
        || (p.abstract || '').toLowerCase().includes(q)
        || p.members.some(m =>
            m.name.toLowerCase().includes(q)
            || (m.roll_number || '').toLowerCase().includes(q));
      const matchYear = yearFilter === 'all' || p.academicYear === yearFilter;
      const matchDomain = domainFilter === 'all' || p.domain === domainFilter;
      return matchSearch && matchYear && matchDomain;
    });
    if (sortBy === 'title') {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'oldest') {
      list = [...list].sort((a, b) => a.updatedAt.localeCompare(b.updatedAt));
    } else {
      list = [...list].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    }
    return list;
  }, [projects, search, yearFilter, domainFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageSlice = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const resetFilters = () => {
    setSearch(''); setYearFilter('all'); setDomainFilter('all'); setSortBy('newest');
  };

  // The page content (filters / stats / cards / pagination) lives here so it can
  // be embedded in either the logged-in sidebar layout or the anonymous shell.
  const content = (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
              <ArchiveIcon className="w-6 h-6 text-primary" /> Project Archive
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Approved and completed micro projects from MLRIT — search by title, domain, team, or member.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-[10px] uppercase text-muted-foreground">Total Projects</p>
            <p className="text-xl font-bold">{projects.length}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-[10px] uppercase text-muted-foreground">Academic Years</p>
            <p className="text-xl font-bold">{years.length}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-[10px] uppercase text-muted-foreground">Domains</p>
            <p className="text-xl font-bold">{domains.length}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-[10px] uppercase text-muted-foreground">Showing</p>
            <p className="text-xl font-bold">{filtered.length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center gap-3 p-3 rounded-xl border border-border bg-card">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, domain, team, member name, or roll number…"
              className="pl-9"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-full md:w-36">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All years</SelectItem>
              {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={domainFilter} onValueChange={setDomainFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Domain" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All domains</SelectItem>
              {domains.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
            <SelectTrigger className="w-full md:w-44">
              <ArrowUpDown className="w-3.5 h-3.5 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
              <SelectItem value="title">Title (A→Z)</SelectItem>
            </SelectContent>
          </Select>
          {(search || yearFilter !== 'all' || domainFilter !== 'all' || sortBy !== 'newest') && (
            <Button variant="ghost" size="sm" onClick={resetFilters}>Reset</Button>
          )}
        </div>

        {/* Project grid */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed rounded-xl border-border/50">
            <ArchiveIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm font-medium">No projects match your filters</p>
            <p className="text-xs text-muted-foreground mt-1">
              {projects.length === 0
                ? 'No approved projects yet — check back after submissions close.'
                : 'Try clearing filters or broadening your search.'}
            </p>
            {projects.length > 0 && (
              <Button variant="outline" size="sm" className="mt-4" onClick={resetFilters}>
                Reset filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {pageSlice.map((p, i) => (
              <PremiumCard
                key={p.id}
                index={i}
                className="p-6 flex flex-col"
              >
                {/* Header: title + status */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h2 className="font-heading font-semibold leading-snug">{p.title}</h2>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${statusStyle(p.status)}`}>
                    {p.status}
                  </span>
                </div>

                {/* Meta chips */}
                <div className="flex flex-wrap items-center gap-1.5 mb-3">
                  {p.domain && (
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400">
                      <Sparkles className="w-2.5 h-2.5" /> {p.domain}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    <Layers className="w-2.5 h-2.5" /> {p.sectionName}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {p.academicYear}
                  </span>
                </div>

                {/* Abstract */}
                {p.abstract && (
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{p.abstract}</p>
                )}

                {/* GitHub */}
                {p.github_link && (
                  <a
                    href={p.github_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline mb-3 truncate"
                  >
                    <Github className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{p.github_link.replace(/^https?:\/\//, '')}</span>
                  </a>
                )}

                {/* Footer: team + members */}
                <div className="mt-auto pt-3 border-t border-border/60">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Users className="w-3.5 h-3.5 text-muted-foreground" />
                    <p className="text-xs font-medium">{p.teamName}</p>
                    <span className="text-[10px] text-muted-foreground">
                      · {p.members.length} member{p.members.length === 1 ? '' : 's'}
                    </span>
                  </div>
                  {p.members.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {p.members.map(m => (
                        <span
                          key={m.id}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground"
                          title={`${m.name}${m.department ? ' • ' + m.department : ''}`}
                        >
                          {m.name}{m.roll_number ? ` (${m.roll_number})` : ''}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </PremiumCard>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <p className="text-xs text-muted-foreground">
              Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage <= 1}>
                <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Prev
              </Button>
              <span className="text-xs tabular-nums">Page {safePage} of {totalPages}</span>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage >= totalPages}>
                Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
    </div>
  );

  // Logged-in users get the same sidebar layout as every other page.
  if (user) {
    return (
      <div className="flex min-h-screen bg-background">
        <AppSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(s => !s)} />
        <main className="flex-1 overflow-x-hidden">{content}</main>
      </div>
    );
  }

  // Anonymous visitors get the public-banner shell.
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-500/5 dark:to-green-500/5">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Viewing the public archive — sign in for your dashboard, projects, and announcements.
          </span>
          <Link to="/login">
            <Button size="sm" variant="outline" className="gap-1.5">
              <LogIn className="w-3.5 h-3.5" /> Sign In
            </Button>
          </Link>
        </div>
      </div>
      {content}
    </div>
  );
};

export default ArchivePage;
