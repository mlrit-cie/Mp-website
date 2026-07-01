import { Router } from 'express';
import healthRoutes from '../modules/health/health.routes';
import authRoutes from '../modules/auth/auth.routes';

/**
 * Root API router. Every feature module mounts here.
 * Still to come: /users, /sections, /teams, /projects, /announcements,
 * /attendance, /timetable, /weekly-updates, /notifications, /files, /admin.
 */
const api = Router();

api.use('/health', healthRoutes);
api.use('/auth', authRoutes);

export default api;
