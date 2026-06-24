import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GraduationCap, Eye, EyeOff, UserPlus, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { UserRole } from "@/lib/types";

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { register } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRoleChange = (value: string) => {
    setFormData({
      ...formData,
      role: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.email || !formData.password) {
      setError("Please fill in all required fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);

    try {
      const result = await register(
        formData.name,
        formData.email,
        formData.password,
        formData.role as UserRole
      );

      if (result.success) {
        navigate("/dashboard");
      } else {
        setError(result.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error("Registration error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-[#dde4dd] flex relative overflow-hidden font-sans select-none selection:bg-[#4edea3] selection:text-[#002113]">
      {/* Background Decorative Blur Orbs */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#10b981]/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#4169e1]/5 blur-3xl" />
      </div>

      {/* Left panel - Brand showcase */}
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
            <UserPlus className="w-3.5 h-3.5" /> Register Account
          </div>

          <h1 className="text-4xl font-heading font-bold text-white leading-tight tracking-tight">
            Join Our<br />
            <span className="bg-gradient-to-r from-[#4edea3] to-[#b6c4ff] bg-clip-text text-transparent">Community.</span>
          </h1>

          <p className="text-white/70 max-w-sm text-sm leading-relaxed">
            Create your account and start managing your projects, collaborating with teams, and tracking your academic progress.
          </p>

          <div className="space-y-3 pt-4">
            {[
              "Access to all project management tools",
              "Collaborate with mentors and peers",
              "Track your academic progress",
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-white/95">
                <div className="w-6 h-6 rounded-full bg-emerald-500/15 border border-emerald-400/20 flex items-center justify-center text-emerald-400 text-xs font-bold">
                  ✓
                </div>
                <span className="text-xs leading-none">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/30 text-[10px] font-mono">&copy; {new Date().getFullYear()} MLRIT. All rights reserved.</p>
      </div>

      {/* Right panel - Registration Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-6 glass-panel p-8 md:p-10 rounded-3xl"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 justify-center mb-4">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#10b981] to-[#4169e1] flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-heading font-bold text-white">ProjectSphere</span>
          </div>

          <div className="text-center lg:text-left">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Login
            </Link>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-[10px] font-semibold uppercase tracking-wider mb-2">
              <UserPlus className="w-3.5 h-3.5" /> Sign Up
            </div>
            <h2 className="text-2xl font-heading font-bold text-white">Create Account</h2>
            <p className="text-white/60 text-xs mt-1">Join MLRIT Project Hub today</p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-destructive/10 text-destructive text-xs border border-destructive/20 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-white/80 text-xs">Full Name *</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-white/80 text-xs">Email Address *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your.email@mlrit.ac.in"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="role" className="text-white/80 text-xs">Role *</Label>
              <Select value={formData.role} onValueChange={handleRoleChange}>
                <SelectTrigger className="w-full rounded-xl bg-white/5 border border-white/10 text-sm focus:ring-primary focus:ring-offset-background">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-900 border border-white/10 text-white rounded-xl">
                  <SelectItem value="student" className="focus:bg-white/10 focus:text-white rounded-lg">Student</SelectItem>
                  <SelectItem value="student_mentor" className="focus:bg-white/10 focus:text-white rounded-lg">Student Mentor</SelectItem>
                  <SelectItem value="faculty" className="focus:bg-white/10 focus:text-white rounded-lg">Faculty</SelectItem>
                  <SelectItem value="admin" className="focus:bg-white/10 focus:text-white rounded-lg">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-white/80 text-xs">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={handleChange}
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

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-white/80 text-xs">Confirm Password *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full rounded-xl text-xs py-3 mt-4"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2 justify-center">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Account...
                </span>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create Account
                </>
              )}
            </Button>
          </form>

          <div className="text-center text-xs pt-1">
            <span className="text-white/50">Already have an account? </span>
            <Link
              to="/login"
              className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
            >
              Sign In
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SignUp;
