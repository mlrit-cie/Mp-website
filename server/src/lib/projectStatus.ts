/**
 * ProjectStatus mapping — the ONE place that converts between the DB/Prisma enum
 * KEY and the frontend's display LABEL.
 *
 * Why this exists: the Prisma enum stores keys (e.g. `STUDENT_MENTOR_REVIEW`), but
 * the frontend's `ProjectStatus` union uses labels (e.g. "Student Mentor Review").
 * Both Prisma model reads and raw-SQL analytics return the KEY, so we convert to
 * the label exactly once — at the API serialization boundary — and parse incoming
 * labels back to the key. Keep the workflow state machine keyed by the enum KEY
 * internally.
 */

import { ProjectStatus } from '@prisma/client';

/** Enum KEY → frontend display label. */
export const STATUS_KEY_TO_LABEL: Record<ProjectStatus, string> = {
  DRAFT: 'Draft',
  STUDENT_MENTOR_REVIEW: 'Student Mentor Review',
  FACULTY_REVIEW: 'Faculty Review',
  APPROVED: 'Approved',
  SUBMITTED_TO_CIE: 'Submitted to CIE',
  COMPLETED: 'Completed',
};

/** Frontend display label → enum KEY (reverse of the above). */
export const STATUS_LABEL_TO_KEY: Record<string, ProjectStatus> = Object.fromEntries(
  Object.entries(STATUS_KEY_TO_LABEL).map(([key, label]) => [label, key as ProjectStatus])
) as Record<string, ProjectStatus>;

/** Serialize a stored enum key to the label the frontend expects. */
export function statusToLabel(status: ProjectStatus): string {
  return STATUS_KEY_TO_LABEL[status];
}

/** Parse a label coming from the client back to the enum key; null if unknown. */
export function labelToStatus(label: string): ProjectStatus | null {
  return STATUS_LABEL_TO_KEY[label] ?? null;
}

/** All labels, in workflow order — handy for validation and analytics columns. */
export const STATUS_LABELS_IN_ORDER: string[] = [
  'Draft',
  'Student Mentor Review',
  'Faculty Review',
  'Approved',
  'Submitted to CIE',
  'Completed',
];
