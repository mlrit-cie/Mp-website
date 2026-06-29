import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/lib/types";
import PendingApprovalScreen from "@/components/PendingApprovalScreen";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import AuthCallback from "./pages/AuthCallback";
import Index from "./pages/Index";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Sections from "./pages/Sections";
import Mentors from "./pages/Mentors";
import Teams from "./pages/Teams";
import Projects from "./pages/Projects";
import Announcements from "./pages/Announcements";
import ArchivePage from "./pages/Archive";
import Profile from "./pages/Profile";
import Timetable from "./pages/Timetable";
import Attendance from "./pages/Attendance";
import WeeklyUpdates from "./pages/WeeklyUpdates";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Keep dashboard data fresh-feeling but avoid hammering Supabase on every tab focus.
      // 30 s is well below the Anthropic prompt-cache TTL analogy: long enough to amortise,
      // short enough that stale dashboards rarely linger.
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  // Unapproved users see the pending screen across every protected route.
  if (user.approved === false) return <PendingApprovalScreen />;
  return <>{children}</>;
};

const RoleGate = ({ roles, children }: { roles: UserRole[]; children: React.ReactNode }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.approved === false) return <PendingApprovalScreen />;
  if (!roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const AppRoutes = () => {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <SignUp />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/archive" element={<ArchivePage />} />
      
      {/* Legacy login routes - redirect to unified login */}
      <Route path="/login/admin" element={<Navigate to="/login" replace />} />
      <Route path="/login/faculty" element={<Navigate to="/login" replace />} />
      <Route path="/login/mentor" element={<Navigate to="/login" replace />} />
      <Route path="/login/mentors" element={<Navigate to="/login" replace />} />
      <Route path="/login/student_mentor" element={<Navigate to="/login" replace />} />
      <Route path="/login/student" element={<Navigate to="/login" replace />} />
      
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/sections" element={<RoleGate roles={['admin', 'faculty', 'student_mentor']}><Sections /></RoleGate>} />
        <Route path="/mentors" element={<RoleGate roles={['admin']}><Mentors /></RoleGate>} />
        <Route path="/attendance" element={<RoleGate roles={['admin']}><Attendance /></RoleGate>} />
        <Route path="/weekly-updates" element={<RoleGate roles={['admin', 'faculty', 'student_mentor']}><WeeklyUpdates /></RoleGate>} />
        <Route path="/timetable" element={<RoleGate roles={['admin', 'faculty', 'student_mentor']}><Timetable /></RoleGate>} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/announcements" element={<Announcements />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
      
      {/* Legacy role routes - redirect to unified login */}
      <Route path="/admin" element={<Navigate to="/login" replace />} />
      <Route path="/student" element={<Navigate to="/login" replace />} />
      <Route path="/faculty" element={<Navigate to="/login" replace />} />
      <Route path="/mentor" element={<Navigate to="/login" replace />} />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
