import React from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard, Users, Layers, FolderKanban, FileCheck,
  Megaphone, Archive, UserCircle, LogOut, GraduationCap, ChevronLeft, ChevronRight, Calendar, ClipboardCheck, ClipboardList
} from 'lucide-react';
import { cn } from '@/lib/utils';
import NotificationsBell from './NotificationsBell';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const AppSidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const roleLabel: Record<string, string> = {
    admin: 'Admin',
    faculty: 'Faculty Mentor',
    student_mentor: 'Student Mentor',
    student: 'Team Portal',
  };

  const roleColor: Record<string, string> = {
    admin: 'bg-destructive', // Red
    faculty: 'bg-secondary', // Blue
    student_mentor: 'bg-primary', // Green
    student: 'bg-secondary/80', // Soft Blue
  };

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'faculty', 'student_mentor', 'student'] },
    { to: '/sections', icon: Layers, label: 'Sections', roles: ['admin', 'faculty', 'student_mentor'] },
    { to: '/timetable', icon: Calendar, label: 'Time Table', roles: ['admin', 'faculty', 'student_mentor'] },
    { to: '/mentors', icon: Users, label: 'Mentors', roles: ['admin'] },
    { to: '/attendance', icon: ClipboardCheck, label: 'Attendance', roles: ['admin'] },
    { to: '/weekly-updates', icon: ClipboardList, label: 'Weekly Updates', roles: ['admin', 'faculty', 'student_mentor'] },
    { to: '/teams', icon: FolderKanban, label: 'My Team', studentLabel: true, roles: ['admin', 'faculty', 'student_mentor', 'student'] },
    { to: '/projects', icon: FileCheck, label: 'My Project', studentLabel: true, roles: ['admin', 'faculty', 'student_mentor', 'student'] },
    { to: '/announcements', icon: Megaphone, label: 'Announcements', roles: ['admin', 'faculty', 'student_mentor', 'student'] },
    { to: '/archive', icon: Archive, label: 'Archive', roles: ['admin', 'faculty', 'student_mentor', 'student'] },
    { to: '/profile', icon: UserCircle, label: 'Profile', roles: ['admin', 'faculty', 'student_mentor', 'student'] },
  ];

  const filteredNav = navItems.filter(item => user && item.roles.includes(user.role));

  const getLabel = (item: typeof navItems[0]) => {
    if (item.studentLabel && user?.role === 'student') {
      return item.label; // Already set as "My Team" / "My Project"
    }
    if (item.studentLabel) {
      return item.to === '/teams' ? 'Teams' : 'Projects';
    }
    return item.label;
  };

  return (
    <aside className={cn(
      "h-screen bg-black/40 backdrop-blur-2xl flex flex-col border-r border-white/5 transition-all duration-300 sticky top-0 z-40",
      collapsed ? "w-[68px]" : "w-64"
    )}>
      {/* Logo */}
      <Link to="/" className="p-4 flex items-center gap-3 border-b border-white/5 hover:bg-white/5 transition-all duration-200">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/10">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="font-heading font-bold text-sidebar-foreground text-sm leading-tight tracking-tight">ProjectSphere</p>
            <p className="text-[10px] text-sidebar-muted">MLRIT Portal</p>
          </div>
        )}
      </Link>

      {/* User info */}
      {!collapsed && user && (
        <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2 bg-white/[0.02]">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={cn("w-2 h-2 rounded-full", roleColor[user.role])} />
              <span className="text-[11px] text-sidebar-muted">{roleLabel[user.role]}</span>
            </div>
          </div>
          <NotificationsBell />
        </div>
      )}
      {collapsed && user && (
        <div className="px-2 py-3 border-b border-white/5 flex justify-center bg-white/[0.02]">
          <NotificationsBell />
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 py-3 space-y-1 px-2 overflow-y-auto">
        {filteredNav.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
              isActive
                ? "bg-white/5 text-primary border-l-2 border-primary font-medium"
                : "text-sidebar-muted hover:bg-white/5 hover:text-sidebar-foreground",
              collapsed && "justify-center px-2"
            )}
          >
            <item.icon className="w-[18px] h-[18px] shrink-0" />
            {!collapsed && <span>{getLabel(item)}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-2 border-t border-white/5 space-y-1">
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-muted hover:bg-destructive/20 hover:text-destructive w-full transition-colors",
            collapsed && "justify-center px-2"
          )}
        >
          <LogOut className="w-[18px] h-[18px] shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
        <button
          onClick={onToggle}
          className="flex items-center justify-center w-full py-1.5 text-sidebar-muted hover:text-sidebar-foreground transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
