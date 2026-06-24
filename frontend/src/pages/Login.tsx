import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, BookOpen, Users, Rocket, Eye, EyeOff, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

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
      const result = await login(email, password);
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
    <div className="min-h-screen bg-[#0a0a0c] text-[#dde4dd] flex relative overflow-hidden font-sans select-none selection:bg-[#4edea3] selection:text-[#002113]">
      {/* Background Decorative Blur Orbs */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#10b981]/5 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-[#4169e1]/5 blur-3xl" />
      </div>

      {/* Left panel — Brand showcase */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative z-10 border-r border-white/5 bg-white/[0.01] backdrop-blur-3xl">
        <div className="absolute inset-0 opacity-15 pointer-events-none" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }} />

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10b981] to-[#4169e1] flex items-center justify-center shadow-lg shadow-emerald-500/10">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-lg font-heading font-bold text-white tracking-tight">ProjectSphere</span>
            <p className="text-white/50 text-[10px]">MLRIT Project Hub</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <GraduationCap className="w-3.5 h-3.5" /> Unified Ecosystem
          </div>

          <h1 className="text-4xl font-heading font-bold text-white leading-tight tracking-tight">
            One Portal.<br />
            <span className="bg-gradient-to-r from-[#4edea3] to-[#b6c4ff] bg-clip-text text-transparent">All Roles.</span>
          </h1>

          <p className="text-white/70 max-w-sm text-sm leading-relaxed">
            Access your personalized workspace based on your role. One dashboard connects students, faculty, and mentors dynamically.
          </p>

          {/* Grid roles */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            {[
              { label: "Admin", sub: "Control Center", icon: Shield, color: "text-red-400", bg: "bg-red-500/10" },
              { label: "Faculty", sub: "Guide & Approve", icon: BookOpen, color: "text-blue-400", bg: "bg-blue-500/10" },
              { label: "Mentor", sub: "Review & Collaborate", icon: Brain, color: "text-emerald-400", bg: "bg-emerald-500/10" },
              { label: "Student", sub: "Build & Showcase", icon: Users, color: "text-blue-300", bg: "bg-blue-300/10" },
            ].map((role) => (
              <div key={role.label} className="flex items-center gap-3 p-3.5 rounded-xl bg-white/5 border border-white/5 backdrop-blur-sm">
                <div className={`w-9 h-9 rounded-lg ${role.bg} flex items-center justify-center`}>
                  <role.icon className={`w-4 h-4 ${role.color}`} />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{role.label}</p>
                  <p className="text-[10px] text-white/50">{role.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/30 text-[10px] font-mono">&copy; {new Date().getFullYear()} MLRIT. All rights reserved.</p>
      </div>

      {/* Right panel — Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-8 glass-panel p-8 md:p-10 rounded-3xl"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 justify-center mb-4">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#10b981] to-[#4169e1] flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-heading font-bold text-white">ProjectSphere</span>
          </div>

          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-[10px] font-semibold uppercase tracking-wider mb-3">
              <GraduationCap className="w-3.5 h-3.5" /> Sign In
            </div>
            <h2 className="text-2xl font-heading font-bold text-white">Welcome Back</h2>
            <p className="text-white/60 text-xs mt-1">Authenticate with your MLRIT credentials</p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-destructive/10 text-destructive text-xs border border-destructive/20 font-medium">
              {error}
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 rounded-xl text-xs py-3"
          >
            <svg className="w-4 h-4" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
              <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
              <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
              <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571.001-.001.002-.001.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
            </svg>
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/5" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-mono">
              <span className="bg-[#0e1511]/90 backdrop-blur-xl px-2.5 text-white/40">
                or sign in with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/80 text-xs">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@mlrit.ac.in"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-white/80 text-xs">Password</Label>
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
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full rounded-xl text-xs py-3 mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2 justify-center">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </span>
              ) : (
                <>
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          <div className="space-y-4 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/5" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-mono">
                <span className="bg-[#0e1511]/90 backdrop-blur-xl px-2.5 text-white/40">
                  Role detected automatically
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 text-white/50 text-[10px] font-mono">
              <span>Admin</span>
              <span>•</span>
              <span>Faculty</span>
              <span>•</span>
              <span>Mentor</span>
              <span>•</span>
              <span>Student</span>
            </div>

            <div className="text-xs pt-1">
              <span className="text-white/50">Don't have an account? </span>
              <Link
                to="/signup"
                className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

import { Brain } from "lucide-react";
export default Login;
