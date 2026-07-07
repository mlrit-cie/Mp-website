import React, { useState } from 'react';
import { MessageSquareWarning, Send, CheckCircle2 } from 'lucide-react';
import { PremiumCard } from '@/components/ui/premium-card';
import { useComplaints } from '@/hooks/useComplaints';

/**
 * Student-facing complaint box. Submitting adds a complaint that shows up on the
 * mentor and admin dashboards.
 */
const ComplaintBox: React.FC<{ index?: number }> = ({ index = 0 }) => {
  const { submitComplaint } = useComplaints();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    submitComplaint({ subject, message });
    setSubject('');
    setMessage('');
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <PremiumCard index={index} interactive="subtle" className="p-6 relative overflow-hidden">
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
      <div className="flex items-center gap-2 mb-4">
        <MessageSquareWarning className="w-4 h-4 text-amber-400" />
        <h3 className="font-heading font-semibold text-white">Raise a Complaint</h3>
      </div>

      {sent && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
          <CheckCircle2 className="w-4 h-4" />
          Complaint submitted — your mentor and admin can see it.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject"
          maxLength={120}
          className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder:text-muted-foreground outline-none focus:border-primary/40 transition-colors"
        />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Describe your complaint..."
          rows={3}
          maxLength={1000}
          className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder:text-muted-foreground outline-none focus:border-primary/40 transition-colors"
        />
        <button
          type="submit"
          disabled={!subject.trim() || !message.trim()}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/10 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send className="w-3.5 h-3.5" /> Submit Complaint
        </button>
      </form>
    </PremiumCard>
  );
};

export default ComplaintBox;
