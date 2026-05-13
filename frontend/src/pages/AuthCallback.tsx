import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { GraduationCap } from 'lucide-react';

const AuthCallback = () => {
  const { completeGoogleLogin } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await completeGoogleLogin();
      if (cancelled) return;
      if (result.success) {
        navigate('/dashboard', { replace: true });
      } else {
        setError(result.message || 'Sign-in failed.');
        setTimeout(() => navigate('/login', { replace: true }), 2500);
      }
    })();
    return () => { cancelled = true; };
  }, [completeGoogleLogin, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-sm w-full text-center space-y-4">
        <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-green-600 flex items-center justify-center">
          <GraduationCap className="w-7 h-7 text-white" />
        </div>
        {error ? (
          <>
            <h2 className="text-lg font-semibold text-destructive">Sign-in blocked</h2>
            <p className="text-sm text-muted-foreground">{error}</p>
            <p className="text-xs text-muted-foreground">Redirecting back to login…</p>
          </>
        ) : (
          <>
            <h2 className="text-lg font-semibold">Finishing sign-in…</h2>
            <p className="text-sm text-muted-foreground">Verifying your MLRIT account.</p>
            <div className="mx-auto w-5 h-5 border-2 border-blue-500/30 border-t-blue-600 rounded-full animate-spin" />
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
