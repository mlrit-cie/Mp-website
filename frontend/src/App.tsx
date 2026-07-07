import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/lib/types";
import PendingApprovalScreen from "@/components/PendingApprovalScreen";
import DashboardLayout from "./layouts/DashboardLayout";

/**
 * Pages are lazy-loaded so each route ships as its own chunk. This is what keeps
 * the heavy 3D landing page (three / @react-three/fiber / drei via FloatingGallery)
 * OUT of the bundle for every other page — they no longer pay for Three.js.
 */
const Login = lazy(() => import("./pages/Login"));
const SignUp = lazy(() => import("./pages/SignUp"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const Index = lazy(() => import("./pages/Index")); // pulls in Three.js — now its own chunk
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Sections = lazy(() => import("./pages/Sections"));
const Mentors = lazy(() => import("./pages/Mentors"));
const Teams = lazy(() => import("./pages/Teams"));
const Projects = lazy(() => import("./pages/Projects"));
const Announcements = lazy(() => import("./pages/Announcements"));
const ArchivePage = lazy(() => import("./pages/Archive"));
const Profile = lazy(() => import("./pages/Profile"));
const Timetable = lazy(() => import("./pages/Timetable"));
const Attendance = lazy(() => import("./pages/Attendance"));
const WeeklyUpdates = lazy(() => import("./pages/WeeklyUpdates"));
const NotFound = lazy(() => import("./pages/NotFound"));

/** Minimal fallback while a route chunk loads. */
const PageLoader = () => (
  <div className="w-full h-screen flex items-center justify-center bg-[#0a0a0c]">
    <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-emerald-500 animate-spin" />
  </div>
);

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
    <Suspense fallback={<PageLoader />}>
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
        <Route path="/sections" element={<RoleGate roles={['admin', 'faculty']}><Sections /></RoleGate>} />
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
    </Suspense>
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
