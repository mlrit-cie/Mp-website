import React from 'react';
import { MessageSquareWarning, CheckCircle2, Inbox } from 'lucide-react';
import { PremiumCard } from '@/components/ui/premium-card';
import { useComplaints } from '@/hooks/useComplaints';

/**
 * Mentor/admin view of student complaints. Shows open complaints first and lets
 * the viewer mark one resolved.
 */
const ComplaintsPanel: React.FC<{ index?: number }> = ({ index = 0 }) => {
  const { complaints, openCount, resolveComplaint } = useComplaints();

  // Open complaints first, then resolved; each group newest-first (already stored newest-first).
  const ordered = [...complaints].sort((a, b) => {
    if (a.status === b.status) return 0;
    return a.status === 'open' ? -1 : 1;
  });

  return (
    <PremiumCard index={index} interactive="subtle" className="p-6 relative overflow-hidden">
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
      <div className="flex items-center gap-2 mb-4">
        <MessageSquareWarning className="w-4 h-4 text-amber-400" />
        <h3 className="font-heading font-semibold text-white">Student Complaints</h3>
        {openCount > 0 && (
          <span className="ml-auto rounded-full bg-amber-500/15 text-amber-300 text-[11px] font-semibold px-2 py-0.5 border border-amber-500/30">
            {openCount} open
          </span>
        )}
      </div>

      {ordered.length === 0 ? (
        <div className="py-8 text-center">
          <Inbox className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No complaints yet</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
          {ordered.map((c) => (
            <div
              key={c.id}
              className={`p-4 rounded-xl border transition-all duration-200 ${
                c.status === 'open'
                  ? 'border-amber-500/20 bg-amber-500/[0.04] hover:border-amber-500/40'
                  : 'border-white/5 bg-white/[0.02] opacity-70'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-white">{c.subject}</p>
                {c.status === 'open' ? (
                  <button
                    onClick={() => resolveComplaint(c.id)}
                    className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[11px] font-medium text-emerald-300 hover:bg-emerald-500/20 transition-colors"
                  >
                    <CheckCircle2 className="w-3 h-3" /> Resolve
                  </button>
                ) : (
                  <span className="shrink-0 inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3 h-3" /> Resolved
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed whitespace-pre-wrap">{c.message}</p>
              <p className="text-[10px] text-muted-foreground mt-2 font-mono">
                {c.authorName} · {c.authorRole} · {new Date(c.createdAt).toLocaleString('en-GB')}
              </p>
            </div>
          ))}
        </div>
      )}
    </PremiumCard>
  );
};

export default ComplaintsPanel;
