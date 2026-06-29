import { Router } from 'express';
import healthRoutes from '../modules/health/health.routes';

/**
 * Root API router. Every feature module mounts here.
 * Phase 1+ will add: /auth, /users, /sections, /teams, /projects,
 * /announcements, /attendance, /timetable, /weekly-updates,
 * /notifications, /files, /admin.
 */
const api = Router();

api.use('/health', healthRoutes);

export default api;
