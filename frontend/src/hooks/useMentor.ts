import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export const useMentor = () => {
  const { user } = useAuth();
  const [assignedSections, setAssignedSections] = useState<any[]>([]);
  const [currentSectionTeams, setCurrentSectionTeams] = useState<any[]>([]);
  const [currentSectionStudents, setCurrentSectionStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAssignedSections = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      let sectionIds: number[] = [];

      if (user.role === 'faculty' || user.role === 'student_mentor') {
        // Get sections where this user is assigned as mentor
        const { data: assignments } = await supabase
          .from('mentor_assignments')
          .select('section_id')
          .eq('user_id', Number(user.id));
        sectionIds = (assignments || []).map((a: any) => a.section_id);
      }

      if (sectionIds.length === 0) {
        setAssignedSections([]);
        return;
      }

      const { data: secs } = await supabase
        .from('sections')
        .select('id, name, department, academic_year, semester, student_count')
        .in('id', sectionIds);

      setAssignedSections(
        (secs || []).map((s: any) => ({
          id: String(s.id), name: s.name, department: s.department,
          academicYear: s.academic_year, semester: s.semester, studentCount: s.student_count,
        }))
      );
    } catch (err) {
      console.error('fetchAssignedSections error:', err);
      setAssignedSections([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchSectionData = useCallback(async (sectionId: string) => {
    if (!sectionId) return;
    try {
      // Fetch teams in this section with their project info
      const { data: teams } = await supabase
        .from('teams')
        .select('id, name, section_id')
        .eq('section_id', Number(sectionId));

      if (!teams || teams.length === 0) {
        setCurrentSectionTeams([]);
        setCurrentSectionStudents([]);
        return;
      }

      const teamIds = teams.map((t: any) => t.id);

      // Fetch projects for these teams
      const { data: projects } = await supabase
        .from('projects')
        .select('id, team_id, title, status, domain, updated_at')
        .in('team_id', teamIds);

      // Fetch team members
      const { data: members } = await supabase
        .from('team_members')
        .select('team_id, student_id')
        .in('team_id', teamIds);

      // Fetch student names
      const studentIds = (members || []).map((m: any) => m.student_id);
      const { data: students } = studentIds.length > 0
        ? await supabase.from('users').select('id, name, email, roll_number').in('id', studentIds)
        : { data: [] };

      const studentMap: Record<number, any> = {};
      (students || []).forEach((s: any) => { studentMap[s.id] = s; });

      const enrichedTeams = teams.map((team: any) => {
        const project = (projects || []).find((p: any) => p.team_id === team.id);
        const teamMembers = (members || [])
          .filter((m: any) => m.team_id === team.id)
          .map((m: any) => studentMap[m.student_id])
          .filter(Boolean);
        return {
          id: String(team.id),
          name: team.name,
          section_id: String(team.section_id),
          project_title: project?.title || null,
          project_status: project?.status || 'Draft',
          project_id: project?.id ? String(project.id) : null,
          project_updated_at: project?.updated_at || null,
          member_names: teamMembers.map((s: any) => s.name).join(', '),
          members: teamMembers.map((s: any) => ({
            id: String(s.id), name: s.name, email: s.email, rollNumber: s.roll_number,
          })),
        };
      });

      setCurrentSectionTeams(enrichedTeams);

      // All students in this section
      const { data: allStudents } = await supabase
        .from('users')
        .select('id, name, email, roll_number')
        .eq('section_id', Number(sectionId))
        .eq('role', 'student');

      const assignedStudentIds = new Set((members || []).map((m: any) => m.student_id));
      setCurrentSectionStudents(
        (allStudents || []).map((s: any) => ({
          id: String(s.id), name: s.name, email: s.email,
          rollNumber: s.roll_number, isUnassigned: !assignedStudentIds.has(s.id),
        }))
      );
    } catch (err) {
      console.error('fetchSectionData error:', err);
    }
  }, []);

  const createTeam = async (sectionId: string, name: string, studentIds: string[]) => {
    if (!user) return false;
    try {
      const { data: team, error: teamErr } = await supabase
        .from('teams')
        .insert([{ section_id: Number(sectionId), name, created_by: Number(user.id) }])
        .select('id').single();
      if (teamErr) throw teamErr;

      if (studentIds.length > 0) {
        const { error: memberErr } = await supabase.from('team_members').insert(
          studentIds.map(sid => ({ team_id: team.id, student_id: Number(sid) }))
        );
        if (memberErr) throw memberErr;
      }

      // Create a default project for the team
      await supabase.from('projects').insert([{
        team_id: team.id, section_id: Number(sectionId),
        title: 'Untitled Project', status: 'Draft',
      }]);

      await fetchSectionData(sectionId);
      return true;
    } catch (err) {
      console.error('createTeam error:', err);
      return false;
    }
  };

  useEffect(() => {
    if (user?.role === 'faculty' || user?.role === 'student_mentor') {
      fetchAssignedSections();
    }
  }, [user, fetchAssignedSections]);

  return {
    assignedSections, currentSectionTeams, currentSectionStudents,
    loading, error, fetchSectionData, createTeam,
    refreshSections: fetchAssignedSections,
  };
};
