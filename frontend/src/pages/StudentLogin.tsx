import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Rocket, Eye, EyeOff, Code, Trophy, Sparkles } from 'lucide-react';

const StudentLogin = () => {
  const [email, setEmail] = useState('akhil@mlrit.ac.in');
  const [password, setPassword] = useState('demo123');
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
      {/* Left panel — Student theme */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-hero-student flex-col justify-between p-12 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-blue-500 blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-blue-700 blur-3xl" />
        </div>
        {/* Decorative diagonal lines */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.08) 35px, rgba(255,255,255,.08) 36px)',
        }} />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-blue-600/90 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Rocket className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-xl font-heading font-bold text-white">ProjectSphere</span>
              <p className="text-blue-200/70 text-xs">Student Portal</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/20 text-blue-200 text-xs font-medium">
            <Rocket className="w-3 h-3" /> Student Access
          </div>
          <h1 className="text-4xl font-heading font-bold text-white leading-tight">
            Learn. Build.<br />
            <span className="text-blue-400">Launch.</span>
          </h1>
          <p className="text-blue-100/60 max-w-md leading-relaxed">
            Submit your micro projects, collaborate with teammates, track progress, receive mentor feedback, and showcase your engineering skills.
          </p>
          <div className="flex gap-8 text-sm pt-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Code className="w-4 h-4 text-blue-300" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">1000+</p>
                <p className="text-blue-200/50 text-xs">Projects</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-blue-300" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">8</p>
                <p className="text-blue-200/50 text-xs">Domains</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Trophy className="w-4 h-4 text-blue-300" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">500+</p>
                <p className="text-blue-200/50 text-xs">Completions</p>
              </div>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-amber-200/30 text-xs">© 2025 MLRIT. All rights reserved.</p>
      </div>

      {/* Right panel — Login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex items-center gap-3 justify-center mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
              <Rocket className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-heading font-bold">Student Portal</span>
          </div>

          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-medium mb-3">
              <Rocket className="w-3 h-3" /> Student
            </div>
            <h2 className="text-2xl font-heading font-bold">Student Sign In</h2>
            <p className="text-muted-foreground mt-1">Access your projects, teams, and submissions</p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm border border-destructive/20">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Student Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="student@mlrit.ac.in"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="focus-visible:ring-blue-500"
              />
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
                  className="focus-visible:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
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
                  <Rocket className="w-4 h-4 mr-2" />
                  Sign In as Student
                </>
              )}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center">
            Use your MLRIT student email to sign in
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;
