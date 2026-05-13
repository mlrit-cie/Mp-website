import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookOpen, Eye, EyeOff, Users, Award, FileText } from 'lucide-react';

const FacultyLogin = () => {
  const [email, setEmail] = useState('anitha@mlrit.ac.in');
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
      {/* Left panel — Faculty theme */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-hero-faculty flex-col justify-between p-12 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-blue-500 blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-indigo-600 blur-3xl" />
        </div>
        {/* Decorative dots */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,.15) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }} />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-blue-500/90 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-xl font-heading font-bold text-white">ProjectSphere</span>
              <p className="text-blue-200/70 text-xs">Faculty Portal</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/20 text-blue-200 text-xs font-medium">
            <BookOpen className="w-3 h-3" /> Faculty Access
          </div>
          <h1 className="text-4xl font-heading font-bold text-white leading-tight">
            Teach. Guide.<br />
            <span className="text-blue-400">Inspire.</span>
          </h1>
          <p className="text-blue-100/60 max-w-md leading-relaxed">
            Manage your sections, review student projects, provide feedback, track academic progress and mentor the next generation of engineers.
          </p>
          <div className="flex gap-8 text-sm pt-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <FileText className="w-4 h-4 text-blue-300" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">24</p>
                <p className="text-blue-200/50 text-xs">Courses</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-300" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">350+</p>
                <p className="text-blue-200/50 text-xs">Students</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Award className="w-4 h-4 text-blue-300" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">15</p>
                <p className="text-blue-200/50 text-xs">Publications</p>
              </div>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-blue-200/30 text-xs">© 2025 MLRIT. All rights reserved.</p>
      </div>

      {/* Right panel — Login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex items-center gap-3 justify-center mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-heading font-bold">Faculty Portal</span>
          </div>

          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-medium mb-3">
              <BookOpen className="w-3 h-3" /> Faculty
            </div>
            <h2 className="text-2xl font-heading font-bold">Faculty Sign In</h2>
            <p className="text-muted-foreground mt-1">Access your teaching dashboard and project reviews</p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm border border-destructive/20">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Faculty Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="faculty@mlrit.ac.in"
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
                  <BookOpen className="w-4 h-4 mr-2" />
                  Sign In as Faculty
                </>
              )}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center">
            Access restricted to registered MLRIT faculty members
          </p>
        </div>
      </div>
    </div>
  );
};

export default FacultyLogin;
