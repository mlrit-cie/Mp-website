import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Phone, Building, Hash, Edit, Save, X, Github, Linkedin, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    githubLink: user?.githubLink || '',
    linkedinLink: user?.linkedinLink || '',
  });

  if (!user) return null;

  const roleLabel: Record<string, string> = {
    admin: 'Admin',
    faculty: 'Faculty Mentor',
    student_mentor: 'Student Mentor',
    student: 'Student',
  };

  const roleBadgeVariant: Record<string, 'admin' | 'faculty' | 'mentor' | 'student'> = {
    admin: 'admin',
    faculty: 'faculty',
    student_mentor: 'mentor',
    student: 'student',
  };

  const handleEdit = () => {
    setForm({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      githubLink: user.githubLink || '',
      linkedinLink: user.linkedinLink || '',
    });
    setEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    await updateProfile(form);
    setSaving(false);
    setEditing(false);
    toast({ title: 'Profile updated', description: 'Your changes have been saved.' });
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Profile</h1>
        <p className="text-muted-foreground text-sm mt-1">Your account information</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-start gap-5">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary font-heading shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-heading font-bold">{user.name}</h2>
              <Badge variant={roleBadgeVariant[user.role]}>{roleLabel[user.role]}</Badge>
            </div>

            {!editing ? (
              <>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Mail className="w-4 h-4 shrink-0" /><span>{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Phone className="w-4 h-4 shrink-0" /><span>{user.phone}</span>
                    </div>
                  )}
                  {user.department && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Building className="w-4 h-4 shrink-0" /><span>{user.department}</span>
                    </div>
                  )}
                  {user.rollNumber && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Hash className="w-4 h-4 shrink-0" /><span>{user.rollNumber}</span>
                    </div>
                  )}
                  {user.githubLink && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Github className="w-4 h-4 shrink-0" />
                      <a href={user.githubLink} target="_blank" rel="noopener noreferrer"
                        className="hover:text-primary transition-colors truncate">{user.githubLink}</a>
                    </div>
                  )}
                  {user.linkedinLink && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Linkedin className="w-4 h-4 shrink-0" />
                      <a href={user.linkedinLink} target="_blank" rel="noopener noreferrer"
                        className="hover:text-primary transition-colors truncate">{user.linkedinLink}</a>
                    </div>
                  )}
                </div>
                <Button variant="outline" size="sm" className="mt-5" onClick={handleEdit}>
                  <Edit className="w-3.5 h-3.5 mr-2" /> Edit Profile
                </Button>
              </>
            ) : (
              <div className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="p-name">Name</Label>
                  <Input id="p-name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="p-email">Email</Label>
                  <Input id="p-email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="p-phone">Phone</Label>
                  <Input id="p-phone" placeholder="+91 9876543210" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="p-github">GitHub</Label>
                  <Input id="p-github" placeholder="https://github.com/username" value={form.githubLink} onChange={e => setForm(f => ({ ...f, githubLink: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="p-linkedin">LinkedIn</Label>
                  <Input id="p-linkedin" placeholder="https://linkedin.com/in/username" value={form.linkedinLink} onChange={e => setForm(f => ({ ...f, linkedinLink: e.target.value }))} />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSave} disabled={saving}>
                    {saving ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-2" />}
                    Save
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setEditing(false)} disabled={saving}>
                    <X className="w-3.5 h-3.5 mr-2" /> Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
