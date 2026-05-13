import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export const useAdmin = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [sectionProjectData, setSectionProjectData] = useState<any[]>([]);
  const [domainPopularity, setDomainPopularity] = useState<{ domain: string; count: number }[]>([]);
  const [mentorWorkload, setMentorWorkload] = useState<{ mentor: string; projects: number }[]>([]);
  const [pendingUsers, setPendingUsers] = useState<{ id: number; name: string; email: string; role: string; created_at: string }[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [facultyMentors, setFacultyMentors] = useState<any[]>([]);
  const [studentMentors, setStudentMentors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMentors = async () => {
    try {
      const { data } = await supabase
        .from('users')
        .select('id, name, email, role, department, roll_number')
        .in('role', ['faculty', 'student_mentor']);
      const all = data || [];
      setFacultyMentors(
        all.filter((u: any) => u.role === 'faculty').map((u: any) => ({
          id: String(u.id), name: u.name, email: u.email,
          role: u.role, department: u.department || 'CSE', rollNumber: u.roll_number,
        }))
      );
      setStudentMentors(
        all.filter((u: any) => u.role === 'student_mentor').map((u: any) => ({
          id: String(u.id), name: u.name, email: u.email,
          role: u.role, department: u.department || 'CSE', rollNumber: u.roll_number,
        }))
      );
    } catch (err) {
      console.error('fetchMentors error:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const [s, sec, p, m, pa] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'student'),
        supabase.from('sections').select('id', { count: 'exact', head: true }),
        supabase.from('projects').select('id', { count: 'exact', head: true }),
        supabase.from('users').select('id', { count: 'exact', head: true }).in('role', ['faculty', 'student_mentor']),
        supabase.from('projects').select('id', { count: 'exact', head: true })
          .in('status', ['Student Mentor Review', 'Faculty Review']),
      ]);
      setStats({
        studentCount: s.count ?? 0,
        sectionCount: sec.count ?? 0,
        projectCount: p.count ?? 0,
        mentorCount: m.count ?? 0,
        pendingApprovals: pa.count ?? 0,
      });
    } catch (err) {
      console.error('fetchStats error:', err);
    }
  };

  const fetchDomainPopularity = async () => {
    try {
      const { data } = await supabase.from('projects').select('domain');
      const counts = new Map<string, number>();
      (data || []).forEach((p: any) => {
        const d = p.domain || 'Unassigned';
        counts.set(d, (counts.get(d) ?? 0) + 1);
      });
      setDomainPopularity(
        Array.from(counts.entries())
          .map(([domain, count]) => ({ domain, count }))
          .sort((a, b) => b.count - a.count)
      );
    } catch (err) {
      console.error('fetchDomainPopularity error:', err);
    }
  };

  const fetchPendingUsers = async () => {
    try {
      const { data } = await supabase
        .from('users')
        .select('id, name, email, role, created_at')
        .eq('approved', false)
        .order('created_at', { ascending: false });
      setPendingUsers((data || []).map((u: any) => ({
        id: u.id, name: u.name, email: u.email, role: u.role, created_at: u.created_at,
      })));
    } catch (err) {
      console.error('fetchPendingUsers error:', err);
    }
  };

  const approveUser = async (userId: number) => {
    try {
      const { error } = await supabase.from('users').update({ approved: true }).eq('id', userId);
      if (error) throw error;
      await fetchPendingUsers();
      return true;
    } catch (err) {
      console.error('approveUser error:', err);
      return false;
    }
  };

  const rejectUser = async (userId: number) => {
    try {
      // Hard-delete the public.users profile row. The auth.users row stays
      // (Supabase Auth manages that); if the rejected person ever signs in again
      // the trigger will recreate a fresh pending row, ready for re-decision.
      const { error } = await supabase.from('users').delete().eq('id', userId);
      if (error) throw error;
      await fetchPendingUsers();
      return true;
    } catch (err) {
      console.error('rejectUser error:', err);
      return false;
    }
  };

  const fetchMentorWorkload = async () => {
    try {
      const { data: mentors } = await supabase
        .from('users')
        .select('id, name, role')
        .in('role', ['faculty', 'student_mentor']);
      const { data: projects } = await supabase
        .from('projects')
        .select('mentor_id')
        .not('mentor_id', 'is', null);

      const counts = new Map<number, number>();
      (projects || []).forEach((p: any) => {
        if (p.mentor_id != null) counts.set(p.mentor_id, (counts.get(p.mentor_id) ?? 0) + 1);
      });

      setMentorWorkload(
        (mentors || [])
          .map((m: any) => ({
            mentor: m.name,
            projects: counts.get(m.id) ?? 0,
          }))
          .sort((a, b) => b.projects - a.projects)
          .slice(0, 10) // top 10
      );
    } catch (err) {
      console.error('fetchMentorWorkload error:', err);
    }
  };

  const fetchSectionProjectStats = async () => {
    try {
      const { data: secs } = await supabase.from('sections').select('id, name');
      const { data: projs } = await supabase.from('projects').select('status, section_id');
      if (!secs || !projs) return;
      const statuses = ['Draft', 'Student Mentor Review', 'Faculty Review', 'Approved', 'Submitted to CIE', 'Completed'];
      setSectionProjectData(
        secs.map((sec: any) => {
          const row: any = { name: sec.name };
          statuses.forEach(s => {
            row[s] = projs.filter((p: any) => p.section_id === sec.id && p.status === s).length;
          });
          return row;
        })
      );
    } catch (err) {
      console.error('fetchSectionProjectStats error:', err);
    }
  };

  const fetchSections = async () => {
    setLoading(true);
    try {
      const { data: secs, error: secErr } = await supabase
        .from('sections')
        .select('id, name, department, academic_year, semester, student_count, faculty_mentor_id, student_mentor_ids');
      if (secErr) throw secErr;

      const { data: mentorData } = await supabase
        .from('users')
        .select('id, name, email, role, department, roll_number')
        .in('role', ['faculty', 'student_mentor']);

      const mentorMap: Record<string, any> = {};
      (mentorData || []).forEach((m: any) => { mentorMap[String(m.id)] = m; });

      setSections(
        (secs || []).map((sec: any) => {
          const fm = sec.faculty_mentor_id ? mentorMap[String(sec.faculty_mentor_id)] : null;
          const smIds: string[] = Array.isArray(sec.student_mentor_ids)
            ? sec.student_mentor_ids.map(String) : [];
          return {
            id: String(sec.id),
            name: sec.name,
            department: sec.department || 'CSE',
            academicYear: sec.academic_year || '2024-25',
            semester: sec.semester || 'Sem 1',
            studentCount: sec.student_count || 0,
            facultyMentor: fm ? { id: String(fm.id), name: fm.name, email: fm.email, role: fm.role, department: fm.department } : null,
            studentMentors: smIds.map(id => mentorMap[id]).filter(Boolean).map((m: any) => ({
              id: String(m.id), name: m.name, email: m.email, role: m.role,
              department: m.department, rollNumber: m.roll_number,
            })),
          };
        })
      );
    } catch (err) {
      setError('Failed to load sections');
      console.error('fetchSections error:', err);
    } finally {
      setLoading(false);
    }
  };

  const addSection = async (data: { name: string; year: string; department: string }) => {
    try {
      const { data: row, error } = await supabase
        .from('sections')
        .insert([{ name: data.name, department: data.department, academic_year: data.year, year: 2024, semester: 'Sem 1', student_count: 0 }])
        .select('id').single();
      if (error) throw error;
      await fetchSections();
      return row?.id ? String(row.id) : true;
    } catch (err) { console.error(err); return false; }
  };

  const updateSection = async (id: string, data: { name: string; year: string; department: string }) => {
    try {
      const { error } = await supabase.from('sections')
        .update({ name: data.name, department: data.department, academic_year: data.year })
        .eq('id', id);
      if (error) throw error;
      await fetchSections();
      return true;
    } catch (err) { console.error(err); return false; }
  };

  const deleteSection = async (id: string) => {
    try {
      const { error } = await supabase.from('sections').delete().eq('id', id);
      if (error) throw error;
      await fetchSections();
      return true;
    } catch (err) { console.error(err); return false; }
  };

  const assignMentors = async (sectionId: string, facultyId: string, studentMentorIds: string[]) => {
    try {
      const { error } = await supabase.from('sections').update({
        faculty_mentor_id: facultyId ? Number(facultyId) : null,
        student_mentor_ids: studentMentorIds.map(Number),
      }).eq('id', sectionId);
      if (error) throw error;
      await fetchSections();
      return true;
    } catch (err) { console.error(err); return false; }
  };

  useEffect(() => {
    if (!user) return;
    fetchSections();
    fetchMentors();
    if (user.role === 'admin') {
      fetchStats();
      fetchSectionProjectStats();
      fetchDomainPopularity();
      fetchMentorWorkload();
      fetchPendingUsers();
    }
  }, [user]);

  return {
    stats, sectionProjectData, domainPopularity, mentorWorkload, pendingUsers,
    sections, facultyMentors, studentMentors, loading, error,
    addSection, updateSection, deleteSection, assignMentors, approveUser, rejectUser,
    refreshSections: fetchSections, refreshStats: fetchStats,
    refreshChart: fetchSectionProjectStats, refreshMentors: fetchMentors,
    refreshDomainPopularity: fetchDomainPopularity,
    refreshMentorWorkload: fetchMentorWorkload,
    refreshPendingUsers: fetchPendingUsers,
  };
};
