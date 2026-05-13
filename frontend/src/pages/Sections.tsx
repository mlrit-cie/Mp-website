import React, { useState } from 'react';
import { Section, User } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Plus, Users, UserCheck, Pencil, Trash2, AlertTriangle, Search, Mail, BookOpen, Download } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { exportToExcel } from '@/lib/export';
import { toast } from '@/hooks/use-toast';

type DialogMode = 'add' | 'edit' | 'remove' | null;

import { useAdmin } from '@/hooks/useAdmin';

const Sections: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const { 
    sections, 
    facultyMentors: facultyList, 
    studentMentors: studentMentorList, 
    loading, 
    error,
    addSection, 
    updateSection,
    deleteSection,
    assignMentors 
  } = useAdmin();

  // Dialog state
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [formData, setFormData] = useState({ name: '', department: 'CSE', academicYear: '', semester: 'Sem 1', studentCount: '' });
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [selectedStudentMentors, setSelectedStudentMentors] = useState<string[]>([]);
  const [formError, setFormError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [removingSection, setRemovingSection] = useState<Section | null>(null);
  
  // Mentor search & quick edit
  const [facultySearch, setFacultySearch] = useState('');
  const [studentMentorSearch, setStudentMentorSearch] = useState('');

  const departments = ['CSE', 'CSM', 'CSD', 'MECH', 'AERO', 'EEE', 'ECE'];
  const semesters = ['Sem 1', 'Sem 2'];

  const resetForm = () => {
    setFormData({ name: '', department: 'CSE', academicYear: '2024-25', semester: 'Sem 1', studentCount: '' });
    setSelectedFaculty('');
    setSelectedStudentMentors([]);
    setFormError('');
    setEditingId(null);
    setRemovingSection(null);
  };

  const closeDialog = () => {
    setDialogMode(null);
    setFacultySearch('');
    setStudentMentorSearch('');
    resetForm();
  };

  /* ── Add ── */
  const openAdd = () => {
    resetForm();
    setDialogMode('add');
  };

  const handleAdd = async () => {
    if (!formData.name.trim() || !formData.academicYear.trim() || !formData.department.trim()) {
      setFormError('Name, academic year, and department are required.');
      return;
    }
    if (!selectedFaculty) {
      setFormError('A faculty mentor must be assigned.');
      return;
    }
    if (selectedStudentMentors.length < 3 || selectedStudentMentors.length > 4) {
      setFormError('A section must have exactly 1 faculty mentor and 3 or 4 student mentors.');
      return;
    }

    const success = await addSection({
      name: formData.name.trim(),
      year: formData.academicYear.trim(),
      department: formData.department.trim()
    });

    if (success) {
      // Find the newly created section ID (or wait for refresh)
      // For simplicity, we'll assign mentors in a second step or if the API supports it
      // Our backend has separate routes for Add Section and Assign Mentors
      // We'll need the ID of the new section. 
      // I'll update the addSection hook to return the ID.
      closeDialog();
    }
  };

  /* ── Edit ── */
  const openEdit = (section: Section) => {
    setEditingId(section.id);
    setFormData({
      name: section.name,
      department: section.department,
      academicYear: section.academicYear,
      semester: section.semester,
      studentCount: String(section.studentCount),
    });
    setSelectedFaculty(section.facultyMentor?.id || '');
    setSelectedStudentMentors(section.studentMentors.map(m => m.id));
    setFormError('');
    setDialogMode('edit');
  };

  const handleEdit = async () => {
    if (!formData.name.trim() || !formData.academicYear.trim() || !formData.department.trim()) {
      setFormError('Name, academic year, and department are required.');
      return;
    }
    
    if (editingId) {
      // 1. Update section details
      const updateSuccess = await updateSection(editingId, {
        name: formData.name.trim(),
        year: formData.academicYear.trim(),
        department: formData.department.trim()
      });

      if (updateSuccess) {
        // 2. Assign mentors
        const assignSuccess = await assignMentors(editingId, selectedFaculty, selectedStudentMentors);
        if (assignSuccess) {
          closeDialog();
        } else {
          setFormError('Section details updated, but mentor assignments failed.');
        }
      } else {
        setFormError('Failed to update section details.');
      }
    }
  };

  /* ── Remove ── */
  const openRemove = (section: Section) => {
    setRemovingSection(section);
    setDialogMode('remove');
  };

  const handleRemove = async () => {
    if (removingSection) {
      const success = await deleteSection(removingSection.id);
      if (success) {
        closeDialog();
      } else {
        setFormError('Failed to remove section.');
      }
    }
  };

  /* ── Toggle student mentor ── */
  const toggleStudentMentor = (id: string) => {
    setSelectedStudentMentors(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 4 ? [...prev, id] : prev
    );
  };

  /* ── Form ── */
  const renderForm = () => (
    <div className="space-y-4 py-2">
      <div className="space-y-2">
        <Label htmlFor="sec-name">Section Name *</Label>
        <Input
          id="sec-name"
          placeholder="e.g. Section A"
          value={formData.name}
          onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label>Department *</Label>
        <div className="flex flex-wrap gap-2">
          {departments.map(dept => (
            <button
              key={dept}
              type="button"
              onClick={() => setFormData(p => ({ ...p, department: dept }))}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                formData.department === dept
                  ? 'bg-primary border-primary text-primary-foreground'
                  : 'border-border text-muted-foreground hover:bg-muted/50'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="sec-year">Academic Year *</Label>
          <Input
            id="sec-year"
            placeholder="e.g. 2024-25"
            value={formData.academicYear}
            onChange={e => setFormData(p => ({ ...p, academicYear: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label>Semester *</Label>
          <div className="flex gap-2">
            {semesters.map(sem => (
              <button
                key={sem}
                type="button"
                onClick={() => setFormData(p => ({ ...p, semester: sem }))}
                className={`flex-1 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                  formData.semester === sem
                    ? 'bg-secondary border-secondary text-secondary-foreground'
                    : 'border-border text-muted-foreground hover:bg-muted/50'
                }`}
              >
                {sem}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sec-count">Student Count</Label>
        <Input
          id="sec-count"
          type="number"
          placeholder="e.g. 65"
          value={formData.studentCount}
          onChange={e => setFormData(p => ({ ...p, studentCount: e.target.value }))}
        />
      </div>

      {/* Faculty Mentor picker */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold">Faculty Mentor</Label>
          <div className="relative w-48">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search faculty..."
              className="pl-8 h-8 text-xs"
              value={facultySearch}
              onChange={e => setFacultySearch(e.target.value)}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto p-1 border rounded-md bg-muted/5">
          <button
            type="button"
            onClick={() => setSelectedFaculty('')}
            className={`flex items-center px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
              selectedFaculty === ''
                ? 'bg-background border-primary shadow-sm'
                : 'border-transparent hover:bg-muted'
            }`}
          >
            None (Unassigned)
          </button>
          
          {facultyList
            .filter(f => f.name.toLowerCase().includes(facultySearch.toLowerCase()))
            .map(f => {
              const isAssigned = sections.some(s => s.id !== editingId && s.facultyMentor?.id === f.id);
              return (
                <div key={f.id} className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isAssigned}
                    onClick={() => setSelectedFaculty(f.id)}
                    className={`flex-1 flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                      selectedFaculty === f.id
                        ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-300 text-blue-700'
                        : isAssigned 
                          ? 'opacity-50 cursor-not-allowed bg-muted border-transparent'
                          : 'border-transparent hover:bg-muted'
                    }`}
                  >
                    <div className="flex flex-col items-start">
                      <span>{f.name}</span>
                      <span className="text-[10px] text-muted-foreground">{f.department}</span>
                    </div>
                    {isAssigned && <Badge variant="outline" className="text-[9px] h-4">Assigned</Badge>}
                  </button>
                </div>
              );
            })}
        </div>
      </div>

      {/* Student Mentors picker */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold">
            Student Mentors
            <span className={`ml-2 text-xs font-normal ${
              selectedStudentMentors.length >= 3 && selectedStudentMentors.length <= 4
                ? 'text-emerald-600'
                : 'text-muted-foreground'
            }`}>
              {selectedStudentMentors.length} / 3-4 selected
            </span>
          </Label>
          <div className="relative w-48">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search by name…"
              className="pl-8 h-8 text-xs"
              value={studentMentorSearch}
              onChange={e => setStudentMentorSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto p-1 border rounded-md bg-muted/5">
          {studentMentorList
            .filter(m => {
              const q = studentMentorSearch.toLowerCase();
              return !q
                || m.name.toLowerCase().includes(q)
                || (m.email || '').toLowerCase().includes(q)
                || (m.rollNumber || '').toLowerCase().includes(q)
                || (m.department || '').toLowerCase().includes(q);
            })
            .map(m => {
              const isAssigned = sections.some(s => s.id !== editingId && s.studentMentors.some(sm => sm.id === m.id));
              const isSelected = selectedStudentMentors.includes(m.id);
              const capReached = !isSelected && selectedStudentMentors.length >= 4;

              return (
                <div key={m.id} className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={(isAssigned && !isSelected) || capReached}
                    onClick={() => toggleStudentMentor(m.id)}
                    title={capReached ? 'Maximum 4 student mentors reached' : undefined}
                    className={`flex-1 flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 text-emerald-700'
                        : (isAssigned || capReached)
                          ? 'opacity-50 cursor-not-allowed bg-muted border-transparent'
                          : 'border-transparent hover:bg-muted'
                    }`}
                  >
                    <div className="flex flex-col items-start">
                      <span>{m.name}</span>
                      <span className="text-[10px] text-muted-foreground">{m.rollNumber} • {m.department}</span>
                    </div>
                    {isAssigned && !isSelected && <Badge variant="outline" className="text-[9px] h-4">Assigned</Badge>}
                    {capReached && !isAssigned && <Badge variant="outline" className="text-[9px] h-4">Cap reached</Badge>}
                  </button>
                </div>
              );
            })}
        </div>
      </div>

      {formError && <p className="text-destructive text-sm">{formError}</p>}
    </div>
  );

  return (
    <>
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Sections</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isAdmin ? 'Manage sections and mentor assignments' : 'Your assigned sections'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && sections.length > 0 && (
            <Button
              variant="outline"
              onClick={() => {
                const rows = sections.map(s => ({
                  ID: s.id,
                  Name: s.name,
                  Department: s.department,
                  'Academic Year': s.academicYear,
                  Semester: s.semester,
                  Students: s.studentCount,
                  'Faculty Mentor': s.facultyMentor?.name || '',
                  'Student Mentors': s.studentMentors.map(m => m.name).join('; '),
                }));
                exportToExcel(rows, `sections_${new Date().toISOString().slice(0, 10)}`, 'Sections');
                toast({ title: 'Sections exported' });
              }}
            >
              <Download className="w-4 h-4 mr-2" /> Export Excel
            </Button>
          )}
          {isAdmin && (
            <Button onClick={openAdd}>
              <Plus className="w-4 h-4 mr-2" /> Add Section
            </Button>
          )}
        </div>
      </div>

      {/* ═══════ Add / Edit Dialog ═══════ */}
      <Dialog open={dialogMode === 'add' || dialogMode === 'edit'} onOpenChange={open => { if (!open) closeDialog(); }}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading">
              {dialogMode === 'edit' ? 'Edit Section' : 'Add New Section'}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === 'edit'
                ? 'Update the section details and mentor assignments.'
                : 'Create a new section and assign mentors.'}
            </DialogDescription>
          </DialogHeader>

          {renderForm()}

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button onClick={dialogMode === 'edit' ? handleEdit : handleAdd}>
              {dialogMode === 'edit' ? (
                <><Pencil className="w-4 h-4 mr-1" /> Save Changes</>
              ) : (
                <><Plus className="w-4 h-4 mr-1" /> Add Section</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════ Remove Confirmation Dialog ═══════ */}
      <Dialog open={dialogMode === 'remove'} onOpenChange={open => { if (!open) closeDialog(); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" /> Remove Section
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to remove <strong>{removingSection?.name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button variant="destructive" onClick={handleRemove}>
              <Trash2 className="w-4 h-4 mr-1" /> Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════ Section Cards ═══════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map(section => (
          <div key={section.id} className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-shadow animate-fade-in flex flex-col">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-heading font-semibold text-lg leading-tight">{section.name}</h3>
                <p className="text-xs font-medium text-primary mt-0.5">{section.department}</p>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{section.academicYear}</Badge>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">{section.semester}</Badge>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">{section.studentCount} Students</span>
              </div>

              <div className="p-3 rounded-lg bg-gradient-card-blue border border-border/50">
                <p className="text-xs font-medium text-muted-foreground mb-1">Faculty Mentor</p>
                {section.facultyMentor ? (
                  <p className="text-sm font-medium">{section.facultyMentor.name}</p>
                ) : (
                  <p className="text-sm text-destructive">Not assigned</p>
                )}
              </div>

              <div className="p-3 rounded-lg bg-gradient-card-green border border-border/50">
                <p className="text-xs font-medium text-muted-foreground mb-1">Student Mentors ({section.studentMentors.length}/4)</p>
                {section.studentMentors.length > 0 ? (
                  <div className="space-y-1">
                    {section.studentMentors.map(m => (
                      <p key={m.id} className="text-sm">{m.name}</p>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-destructive">Not assigned</p>
                )}
              </div>

              {section.studentMentors.length < 3 || section.studentMentors.length > 4 || !section.facultyMentor ? (
                <div className="flex items-center gap-1.5 text-xs text-destructive">
                  <UserCheck className="w-3 h-3" />
                  <span>Mentor assignment incomplete</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-primary">
                  <UserCheck className="w-3 h-3" />
                  <span>Fully assigned</span>
                </div>
              )}

              {/* Edit / Remove buttons — admin only */}
              {isAdmin && (
                <div className="flex gap-2 pt-1">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(section)}>
                    <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-destructive hover:text-destructive"
                    onClick={() => openRemove(section)}
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
        {sections.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground text-sm col-span-3">
            No sections found. Click "Add Section" to create one.
          </div>
        )}
      </div>
    </div>

    </>
  );
};

export default Sections;
