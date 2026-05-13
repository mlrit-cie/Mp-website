import React from 'react';
import { Button } from '@/components/ui/button';
import { UserCheck, Check, X, Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { exportToExcel } from '@/lib/export';
import { useAdmin } from '@/hooks/useAdmin';

const ROLE_LABEL: Record<string, string> = {
  admin: 'Admin',
  faculty: 'Faculty',
  student_mentor: 'Student Mentor',
  student: 'Student',
};

/**
 * Admin-only panel listing all users awaiting approval, with one-click
 * Approve / Reject and an Excel export. Renders nothing when the list is
 * empty so it can be safely dropped on any admin surface (dashboard, profile,
 * etc.) without leaving an awkward empty block.
 */
const PendingApprovalsPanel: React.FC<{ variant?: 'amber' | 'card' }> = ({ variant = 'amber' }) => {
  const { pendingUsers, approveUser, rejectUser } = useAdmin();

  if (!pendingUsers || pendingUsers.length === 0) return null;

  const containerClass = variant === 'amber'
    ? 'rounded-xl border border-amber-300/50 dark:border-amber-500/30 bg-amber-50/50 dark:bg-amber-500/5 p-5'
    : 'rounded-xl border border-border bg-card p-5';

  const titleClass = variant === 'amber'
    ? 'font-heading font-semibold text-amber-800 dark:text-amber-300'
    : 'font-heading font-semibold';

  const dividerClass = variant === 'amber'
    ? 'divide-y divide-amber-200/60 dark:divide-amber-500/20'
    : 'divide-y divide-border';

  const badgeClass = variant === 'amber'
    ? 'bg-amber-200/70 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300'
    : 'bg-primary/10 text-primary';

  const handleApprove = async (id: number, name: string) => {
    const ok = await approveUser(id);
    if (ok) toast({ title: `Approved ${name}` });
    else toast({ title: 'Approval failed', variant: 'destructive' });
  };

  const handleReject = async (id: number, name: string) => {
    if (!window.confirm(`Reject ${name}? This deletes their profile. If they sign in again they'll appear as pending again.`)) return;
    const ok = await rejectUser(id);
    if (ok) toast({ title: `Rejected ${name}` });
    else toast({ title: 'Reject failed', variant: 'destructive' });
  };

  const handleExport = () => {
    const rows = pendingUsers.map(u => ({
      ID: u.id,
      Name: u.name,
      Email: u.email,
      Role: ROLE_LABEL[u.role] || u.role,
      'Signed Up': u.created_at ? new Date(u.created_at).toLocaleString('en-GB') : '',
    }));
    exportToExcel(rows, `pending_approvals_${new Date().toISOString().slice(0, 10)}`, 'Pending');
    toast({ title: `Exported ${rows.length} pending user${rows.length === 1 ? '' : 's'}` });
  };

  return (
    <div className={containerClass}>
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <UserCheck className={`w-4 h-4 ${variant === 'amber' ? 'text-amber-700 dark:text-amber-400' : 'text-primary'}`} />
          <h3 className={titleClass}>Pending Approvals</h3>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeClass}`}>
            {pendingUsers.length}
          </span>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExport}>
          <Download className="w-3.5 h-3.5" /> Export Excel
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Mentors, faculty, and students waiting for approval. Approve to grant access, reject to delete the profile.
      </p>
      <ul className={dividerClass}>
        {pendingUsers.map(u => (
          <li key={u.id} className="py-2.5 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{u.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {u.email} · {ROLE_LABEL[u.role] || u.role}
                {u.created_at && ` · joined ${new Date(u.created_at).toLocaleDateString('en-GB')}`}
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                size="sm"
                variant="outline"
                className="gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
                onClick={() => handleReject(u.id, u.name)}
              >
                <X className="w-3.5 h-3.5" /> Reject
              </Button>
              <Button size="sm" className="gap-1" onClick={() => handleApprove(u.id, u.name)}>
                <Check className="w-3.5 h-3.5" /> Approve
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PendingApprovalsPanel;
