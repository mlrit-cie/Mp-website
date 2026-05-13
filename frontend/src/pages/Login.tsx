import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, BookOpen, Users, Rocket, Eye, EyeOff, GraduationCap } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Invalid credentials. Please check your email and password.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — Unified theme */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex-col justify-between p-12 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-blue-400 blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-purple-500 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-indigo-400 blur-3xl" />
        </div>
        
        {/* Decorative grid pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-xl font-heading font-bold text-white">ProjectSphere</span>
              <p className="text-white/70 text-xs">MLRIT Project Hub</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs font-medium">
            <GraduationCap className="w-3 h-3" /> Unified Portal
          </div>
          
          <h1 className="text-4xl font-heading font-bold text-white leading-tight">
            One Portal.<br />
            <span className="text-blue-200">All Roles.</span>
          </h1>
          
          <p className="text-white/80 max-w-md leading-relaxed">
            Access your personalized dashboard based on your role. Whether you're an admin, faculty, mentor, or student — one login gets you where you need to be.
          </p>

          {/* Role indicators */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-red-200" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Admin</p>
                <p className="text-xs text-white/60">Full Control</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-200" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Faculty</p>
                <p className="text-xs text-white/60">Teach & Guide</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-emerald-200" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Mentor</p>
                <p className="text-xs text-white/60">Lead Teams</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Rocket className="w-5 h-5 text-purple-200" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Student</p>
                <p className="text-xs text-white/60">Build & Learn</p>
              </div>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-white/30 text-xs">© 2025 MLRIT. All rights reserved.</p>
      </div>

      {/* Right panel — Login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 justify-center mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-heading font-bold">ProjectSphere</span>
          </div>

          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-500/10 dark:to-purple-500/10 text-blue-600 dark:text-blue-400 text-xs font-medium mb-3">
              <GraduationCap className="w-3 h-3" /> Unified Login
            </div>
            <h2 className="text-2xl font-heading font-bold">Welcome Back</h2>
            <p className="text-muted-foreground mt-1">Sign in with your MLRIT credentials</p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm border border-destructive/20">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@mlrit.ac.in"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="focus-visible:ring-blue-500"
                autoComplete="email"
              />
              <p className="text-xs text-muted-foreground">
                Use your MLRIT email address
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="focus-visible:ring-blue-500 pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <>
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          <div className="space-y-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Your role is detected automatically
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Shield className="w-3 h-3" />
              <BookOpen className="w-3 h-3" />
              <Users className="w-3 h-3" />
              <Rocket className="w-3 h-3" />
              <span>Admin • Faculty • Mentor • Student</span>
            </div>
            
            <div className="text-center text-sm pt-2">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Link 
                to="/signup" 
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
