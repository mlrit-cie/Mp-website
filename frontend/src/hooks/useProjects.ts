import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export const useProjects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('projects')
        .select(`
          id, title, domain, abstract, github_link, video_link,
          ppt_file, report_file, yukthi_file, feedback, deadline,
          status, updated_at, section_id, team_id,
          teams!inner(id, name, section_id,
            sections(id, name, department)
          )
        `);

      if (user.role === 'student') {
        // Find the team this student belongs to
        const { data: membership } = await supabase
          .from('team_members')
          .select('team_id')
          .eq('student_id', Number(user.id))
          .single();
        if (!membership) { setProjects([]); setLoading(false); return; }
        query = query.eq('team_id', membership.team_id);
      } else if (user.role === 'student_mentor' || user.role === 'faculty') {
        // Get sections assigned to this mentor
        const { data: assignments } = await supabase
          .from('mentor_assignments')
          .select('section_id')
          .eq('user_id', Number(user.id));
        const sectionIds = (assignments || []).map((a: any) => a.section_id);
        if (sectionIds.length === 0) { setProjects([]); setLoading(false); return; }
        query = query.in('section_id', sectionIds);
      }
      // admin sees all

      const { data, error: err } = await query.order('updated_at', { ascending: false });
      if (err) throw err;

      setProjects(
        (data || []).map((p: any) => ({
          id: String(p.id),
          title: p.title,
          domain: p.domain,
          abstract: p.abstract,
          github_link: p.github_link,
          video_link: p.video_link,
          ppt_file: p.ppt_file,
          report_file: p.report_file,
          yukthi_file: p.yukthi_file,
          feedback: p.feedback,
          deadline: p.deadline,
          status: p.status,
          updated_at: p.updated_at,
          team_id: String(p.team_id),
          section_id: p.section_id ? String(p.section_id) : null,
          team_name: p.teams?.name || '—',
          section_name: p.teams?.sections?.name || '—',
        }))
      );
    } catch (err: any) {
      setError('Failed to load projects');
      console.error('fetchProjects error:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateProject = async (projectId: string, payload: Record<string, any>) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', Number(projectId));
      if (error) throw error;
      await fetchProjects();
      return true;
    } catch (err) {
      console.error('updateProject error:', err);
      setError('Failed to update project');
      return false;
    }
  };

  return { projects, loading, error, fetchProjects, updateProject };
};
