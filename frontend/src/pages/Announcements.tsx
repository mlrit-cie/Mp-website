import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Megaphone, Download, EyeOff, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { PremiumCard } from '@/components/ui/premium-card';

const Announcements: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isMentor = user?.role === 'faculty' || user?.role === 'student_mentor';
  const canCreate = isAdmin || isMentor;

  const { announcements, loading, error, createAnnouncement, deleteAnnouncement } = useAnnouncements();

  const [isOpen, setIsOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [targetAudience, setTargetAudience] = useState<'all' | 'mentors_only'>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleCreate = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    setIsSubmitting(true);
    const success = await createAnnouncement({
      title: newTitle.trim(),
      content: newContent.trim(),
      target_audience: targetAudience,
    });
    setIsSubmitting(false);

    if (success) {
      setIsOpen(false);
      setNewTitle('');
      setNewContent('');
      setTargetAudience('all');
      toast({
        title: 'Announcement posted',
        description: targetAudience === 'all'
          ? 'Your message has been posted to all users.'
          : 'Your message has been posted to mentors only.',
      });
    } else {
      toast({ title: 'Failed to post', description: 'Please try again.', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    const success = await deleteAnnouncement(id);
    setDeletingId(null);
    if (success) {
      toast({ title: 'Announcement deleted' });
    } else {
      toast({ title: 'Delete failed', description: 'Please try again.', variant: 'destructive' });
    }
  };

  const handleExport = () => {
    const headers = ['ID', 'Title', 'Content', 'Author', 'Created At', 'Audience'];
    const csvData = announcements.map(a => [
      a.id,
      `"${a.title.replace(/"/g, '""')}"`,
      `"${a.content.replace(/"/g, '""')}"`,
      a.author,
      new Date(a.created_at).toLocaleDateString('en-GB'),
      a.target_audience,
    ]);

    const csvContent = [headers, ...csvData].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', 'announcements_export.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: 'Export complete', description: 'Announcements downloaded as CSV.' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Announcements</h1>
          <p className="text-muted-foreground text-sm mt-1">Important notices and updates</p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <Button variant="outline" size="sm" onClick={handleExport} disabled={announcements.length === 0}>
              <Download className="w-4 h-4 mr-2" /> Export CSV
            </Button>
          )}
          {canCreate && (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" /> New Announcement
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Announcement</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="ann-title">Title</Label>
                    <Input
                      id="ann-title"
                      value={newTitle}
                      onChange={e => setNewTitle(e.target.value)}
                      placeholder="e.g. Project Phase 1 Submission"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ann-content">Content</Label>
                    <Textarea
                      id="ann-content"
                      value={newContent}
                      onChange={e => setNewContent(e.target.value)}
                      placeholder="Enter the announcement details..."
                      rows={5}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ann-audience">Target Audience</Label>
                    <Select
                      value={targetAudience}
                      onValueChange={(value: 'all' | 'mentors_only') => setTargetAudience(value)}
                    >
                      <SelectTrigger id="ann-audience">
                        <SelectValue placeholder="Select audience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users (Students & Mentors)</SelectItem>
                        <SelectItem value="mentors_only">Mentors Only (Admin & Mentors)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreate} disabled={isSubmitting || !newTitle.trim() || !newContent.trim()}>
                    {isSubmitting ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Posting...</>
                    ) : (
                      'Post Announcement'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Announcement List */}
      {!loading && !error && (
        <div className="space-y-4">
          {announcements.map((a, i) => (
            <PremiumCard
              key={a.id}
              index={i}
              interactive="subtle"
              className="p-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Megaphone className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-heading font-semibold">{a.title}</h3>
                      {a.target_audience === 'mentors_only' && (
                        <span className="flex items-center gap-1 text-[10px] bg-amber-500/10 text-amber-500 py-0.5 px-2 rounded-full border border-amber-500/20 shrink-0">
                          <EyeOff className="w-3 h-3" /> Mentors Only
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-muted-foreground">
                        {new Date(a.created_at).toLocaleDateString('en-GB')}
                      </span>
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-7 h-7 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(a.id)}
                          disabled={deletingId === a.id}
                          id={`delete-announcement-${a.id}`}
                        >
                          {deletingId === a.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{a.content}</p>
                  <p className="text-xs text-muted-foreground mt-3">— {a.author}</p>
                </div>
              </div>
            </PremiumCard>
          ))}

          {announcements.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed rounded-xl border-border/50">
              <Megaphone className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">No announcements yet</h3>
              <p className="text-sm text-muted-foreground/60">Check back later for updates</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Announcements;
