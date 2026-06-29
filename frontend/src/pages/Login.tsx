import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, BookOpen, Users, Eye, EyeOff, GraduationCap, Brain } from "lucide-react";
import { motion } from "framer-motion";
import { UserRole } from "@/lib/types";
import { PremiumCard } from "@/components/ui/premium-card";

const ROLES_LIST = [
  { value: "admin", label: "Admin", sub: "Control Center", icon: Shield, activeClass: "border-primary bg-primary text-white shadow-lg shadow-primary/20", color: "text-red-500", activeColor: "text-red-400", hoverBg: "hover:bg-white/5 hover:border-white/20" },
  { value: "faculty", label: "Faculty", sub: "Guide & Approve", icon: BookOpen, activeClass: "border-primary bg-primary text-white shadow-lg shadow-primary/20", color: "text-blue-500", activeColor: "text-blue-400", hoverBg: "hover:bg-white/5 hover:border-white/20" },
  { value: "student_mentor", label: "Mentor", sub: "Review & Collaborate", icon: Brain, activeClass: "border-primary bg-primary text-white shadow-lg shadow-primary/20", color: "text-emerald-500", activeColor: "text-emerald-400", hoverBg: "hover:bg-white/5 hover:border-white/20" },
  { value: "student", label: "Student", sub: "Build & Showcase", icon: Users, activeClass: "border-primary bg-primary text-white shadow-lg shadow-primary/20", color: "text-indigo-500", activeColor: "text-indigo-400", hoverBg: "hover:bg-white/5 hover:border-white/20" },
] as const;

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>("student");
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    console.log("Selected Role:", role);
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setIsLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      setError("Could not start Google sign-in. Please try again.");
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Selected Role:", selectedRole);
      const result = await login(email, password, selectedRole);
      if (result.success) {
        navigate("/dashboard");
      } else {
        setError(result.message || "Invalid credentials. Please check your email and password.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-[#dde4dd] flex flex-col justify-center items-center relative overflow-hidden font-body selection:bg-primary selection:text-white">
      {/* Background Decorative Blur Orbs */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-secondary/5 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      {/* Top Navbar */}
      <div className="absolute top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-6 md:px-12">
        <Link to="/" className="flex items-center gap-2 group cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center transition-transform group-hover:scale-105">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="font-heading font-bold text-white tracking-tight">ProjectSphere</span>
        </Link>

        <Link
          to="/signup"
          className="px-6 py-2.5 rounded-full border border-white/10 bg-white/5 text-white text-sm font-medium hover:bg-white/10 transition-all hover:scale-105 active:scale-95 shadow-sm"
        >
          Sign Up
        </Link>
      </div>

      {/* Login Form Card */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative z-10 w-full mt-28 mb-12">
        <PremiumCard
          index={0}
          interactive={false}
          className="w-full max-w-2xl p-10 md:p-16 space-y-10"
        >
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-primary text-xs font-bold uppercase tracking-wider mb-2">
              <GraduationCap className="w-4.5 h-4.5" /> Sign In
            </div>
            <h2 className="text-4xl md:text-5xl font-heading font-extrabold text-white tracking-tight leading-tight">Welcome Back</h2>
            <p className="text-white/60 text-sm md:text-base font-medium">Authenticate with your credentials to access your portal</p>
          </div>

          {/* Interactive Role Grid */}
          <div className="space-y-3.5">
            <Label className="text-white/80 text-xs md:text-sm font-bold uppercase tracking-wider ml-1">Login As</Label>
            <div className="grid grid-cols-2 gap-4">
              {ROLES_LIST.map((roleItem) => {
                const isSelected = selectedRole === roleItem.value;
                return (
                  <button
                    key={roleItem.value}
                    type="button"
                    onClick={() => handleRoleSelect(roleItem.value)}
                    className={`flex items-center gap-4 p-4.5 rounded-[1.25rem] border text-left transition-all duration-300 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-white ${isSelected
                        ? roleItem.activeClass + " scale-[1.02] shadow-md"
                        : "bg-white/[0.01] border-white/5 text-white/80 " + roleItem.hoverBg + " hover:-translate-y-0.5 hover:shadow-sm"
                      }`}
                    aria-pressed={isSelected}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors shrink-0 ${isSelected ? "bg-white/10 " + roleItem.activeColor : "bg-white/5 " + roleItem.color}`}>
                      <roleItem.icon className="w-5.5 h-5.5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold leading-none mb-1">{roleItem.label}</p>
                      <p className={`text-[10px] md:text-xs leading-none ${isSelected ? "text-white/60" : "text-white/40"}`}>{roleItem.sub}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 rounded-xl bg-red-500/10 text-red-400 text-sm border border-red-500/20 font-medium"
            >
              {error}
            </motion.div>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white text-sm py-6 shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
              <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
              <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
              <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571.001-.001.002-.001.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
            </svg>
            <span className="font-semibold text-white">Continue with Google</span>
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase font-mono tracking-wider">
              <span className="bg-[#0a0a0c] px-4 text-white/40">
                or sign in with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/85 text-sm font-semibold ml-1">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@mlrit.ac.in"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                required
                className="border-white/10 bg-white/[0.02] text-white focus-visible:ring-primary focus-visible:ring-offset-background placeholder:text-white/30 rounded-2xl py-6 px-4 text-sm transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-white/85 text-sm font-semibold ml-1">Password</Label>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="border-white/10 bg-white/[0.02] text-white focus-visible:ring-primary focus-visible:ring-offset-background placeholder:text-white/30 rounded-2xl py-6 pl-4 pr-12 text-sm transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full rounded-full text-sm py-6 bg-primary text-white hover:bg-primary/90 transition-all hover:scale-[1.01] active:scale-[0.99] mt-8 shadow-lg shadow-primary/10 cursor-pointer font-bold"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2 justify-center">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </span>
              ) : (
                <span className="flex items-center justify-center font-bold text-sm">
                  <GraduationCap className="w-5 h-5 mr-2" />
                  Sign In
                </span>
              )}
            </Button>
          </form>

          <div className="space-y-6 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase font-mono tracking-wider">
                <span className="bg-[#0a0a0c] px-4 text-white/40">
                  Role selected manually
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2.5 text-white text-xs font-mono font-bold uppercase tracking-wider">
              <span>Selected:</span>
              <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-primary">
                {selectedRole === "student_mentor" ? "Mentor" : selectedRole}
              </span>
            </div>

            <div className="text-sm pt-2">
              <span className="text-white/50 font-medium">Don't have an account? </span>
              <Link
                to="/signup"
                className="text-white hover:underline font-bold transition-all focus-visible:outline-none"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </PremiumCard>
      </div>
    </div>
  );
};

export default Login;
