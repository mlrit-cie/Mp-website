import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Eye, EyeOff, Settings, Users, LayoutDashboard } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('rajesh@mlrit.ac.in');
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
      {/* Left panel — Admin theme */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-hero-admin flex-col justify-between p-12 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-red-500 blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-rose-600 blur-3xl" />
        </div>
        {/* Decorative grid pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-red-500/90 flex items-center justify-center shadow-lg shadow-red-500/30">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-xl font-heading font-bold text-white">ProjectSphere</span>
              <p className="text-red-200/70 text-xs">Administrative Portal</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 border border-red-400/20 text-red-200 text-xs font-medium">
            <Shield className="w-3 h-3" /> Administrator Access
          </div>
          <h1 className="text-4xl font-heading font-bold text-white leading-tight">
            Command. Configure.<br />
            <span className="text-red-400">Control.</span>
          </h1>
          <p className="text-red-100/60 max-w-md leading-relaxed">
            Full system administration — manage departments, configure academic settings, oversee faculty assignments, and monitor platform-wide analytics.
          </p>
          <div className="flex gap-8 text-sm pt-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                <LayoutDashboard className="w-4 h-4 text-red-300" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">12</p>
                <p className="text-red-200/50 text-xs">Departments</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                <Users className="w-4 h-4 text-red-300" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">200+</p>
                <p className="text-red-200/50 text-xs">Faculty</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                <Settings className="w-4 h-4 text-red-300" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">48</p>
                <p className="text-red-200/50 text-xs">Active Configs</p>
              </div>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-red-200/30 text-xs">© 2025 MLRIT. All rights reserved.</p>
      </div>

      {/* Right panel — Login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex items-center gap-3 justify-center mb-4">
            <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-heading font-bold">Admin Portal</span>
          </div>

          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-medium mb-3">
              <Shield className="w-3 h-3" /> Administrator
            </div>
            <h2 className="text-2xl font-heading font-bold">Admin Sign In</h2>
            <p className="text-muted-foreground mt-1">Access the system administration dashboard</p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm border border-destructive/20">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Admin Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@mlrit.ac.in"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="focus-visible:ring-red-500"
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
                  className="focus-visible:ring-red-500"
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
              className="w-full bg-red-600 hover:bg-red-700 text-white"
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
                  <Shield className="w-4 h-4 mr-2" />
                  Sign In as Admin
                </>
              )}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center">
            Restricted access — authorized administrators only
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
