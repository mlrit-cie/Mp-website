import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export const useAdmin = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [sectionProjectData, setSectionProjectData] = useState<any[]>([]);
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
      const [s, sec, p, m] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'student'),
        supabase.from('sections').select('id', { count: 'exact', head: true }),
        supabase.from('projects').select('id', { count: 'exact', head: true }),
        supabase.from('users').select('id', { count: 'exact', head: true }).in('role', ['faculty', 'student_mentor']),
      ]);
      setStats({
        studentCount: s.count ?? 0,
        sectionCount: sec.count ?? 0,
        projectCount: p.count ?? 0,
        mentorCount: m.count ?? 0,
      });
    } catch (err) {
      console.error('fetchStats error:', err);
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
    }
  }, [user]);

  return {
    stats, sectionProjectData, sections, facultyMentors, studentMentors, loading, error,
    addSection, updateSection, deleteSection, assignMentors,
    refreshSections: fetchSections, refreshStats: fetchStats,
    refreshChart: fetchSectionProjectStats, refreshMentors: fetchMentors,
  };
};
