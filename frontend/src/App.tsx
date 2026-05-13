import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AppRoutes = () => {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Index />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <SignUp />} />
      
      {/* Legacy login routes - redirect to unified login */}
      <Route path="/login/admin" element={<Navigate to="/login" replace />} />
      <Route path="/login/faculty" element={<Navigate to="/login" replace />} />
      <Route path="/login/mentor" element={<Navigate to="/login" replace />} />
      <Route path="/login/mentors" element={<Navigate to="/login" replace />} />
      <Route path="/login/student_mentor" element={<Navigate to="/login" replace />} />
      <Route path="/login/student" element={<Navigate to="/login" replace />} />
      
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/sections" element={<Sections />} />
        <Route path="/mentors" element={<Mentors />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/announcements" element={<Announcements />} />
        <Route path="/archive" element={<ArchivePage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/timetable" element={<Timetable />} />
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
