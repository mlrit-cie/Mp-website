import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Clock, ShieldAlert, LogOut, Mail } from 'lucide-react';

const PendingApprovalScreen: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md w-full text-center space-y-5">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/10 to-green-500/10 flex items-center justify-center border border-border">
          <ShieldAlert className="w-8 h-8 text-primary" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-heading font-bold">Admin Approval Required</h1>
          <p className="text-sm text-muted-foreground">
            Your account has been created, but an administrator needs to approve it before
            you can access the portal. You'll be able to sign in normally once that's done.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 text-left space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">Email:</span>
            <span className="font-medium truncate">{user?.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">Status:</span>
            <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Pending approval
            </span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          If you think this is a mistake, contact the MLRIT Micro Projects admin.
        </p>

        <Button
          variant="outline"
          onClick={() => { void logout(); }}
          className="gap-2"
        >
          <LogOut className="w-4 h-4" /> Sign out
        </Button>
      </div>
    </div>
  );
};

export default PendingApprovalScreen;
