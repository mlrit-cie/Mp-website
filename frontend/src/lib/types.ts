export type UserRole = 'admin' | 'faculty' | 'student_mentor' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  approved?: boolean;
  rollNumber?: string;
  department?: string;
  phone?: string;
  avatar?: string;
  githubLink?: string;
  linkedinLink?: string;
}

export interface Section {
  id: string;
  name: string;
  department: string;
  academicYear: string;
  semester: string;
  facultyMentor: User | null;
  studentMentors: User[];
  studentCount: number;
}

export interface Team {
  id: string;
  name: string;
  sectionId: string;
  members: User[];
  leadId: string;
  teamSize: number;
  projectId?: string;
}

export interface Project {
  id: string;
  title: string;
  domain: ProjectDomain;
  teamId: string;
  sectionId: string;
  academicYear: string;
  semester: string;
  status: ProjectStatus;
  abstract?: string;
  githubLink?: string;
  videoLink?: string;
  pptFile?: string;
  reportFile?: string;
  yukthiFile?: string;
  submittedAt?: string;
  updatedAt: string;
  feedback?: string;
}

export type ProjectDomain =
  | 'Web Development'
  | 'App Development'
  | 'Automation'
  | 'Artificial Intelligence'
  | 'IoT'
  | 'Drone Technology'
  | 'Robotics'
  | 'Chatbots';

export type ProjectStatus =
  | 'Draft'
  | 'Student Mentor Review'
  | 'Faculty Review'
  | 'Approved'
  | 'Submitted to CIE'
  | 'Completed';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  targetAudience: 'all' | 'mentors_only';
}

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

