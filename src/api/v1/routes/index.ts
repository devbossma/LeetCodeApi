import { Router } from 'express';
// import authRoutes from './auth.routes.js';
import problemRoutes from './problems.routes';

const router = Router();

// Health check for API v1
router.get('/health', (req, res) => {
    res.json({
        version: 'v1',
        status: 'ok',
        timestamp: new Date().toISOString(),
    });
});

// Mount routes
// router.use('/auth', authRoutes);
router.use('/problems', problemRoutes);

export default router;