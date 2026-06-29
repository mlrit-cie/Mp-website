import { Router } from 'express';
import { getHealth, getDbHealth } from './health.controller';

/**
 * Health module — the reference implementation of the layered pattern
 * (routes → controller → service). Other modules follow the same shape.
 */
const router = Router();

router.get('/', getHealth);
router.get('/db', getDbHealth);

export default router;
