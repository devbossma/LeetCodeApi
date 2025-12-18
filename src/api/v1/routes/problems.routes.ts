import { Router } from 'express';
import { ProblemController } from '../controllers/problems.controller';
import { authenticate } from '../../../middleware/auth.middleware';

const router = Router();
const controller = new ProblemController();

/**
 * @swagger
 * /api/v1/problems:
 *   get:
 *     summary: Get paginated list of problems
 *     tags: [Problems]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 20
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [Easy, Medium, Hard]
 *       - in: query
 *         name: topic
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/', controller.getProblems);

/**
 * @swagger
 * /api/v1/problems/search:
 *   get:
 *     summary: Search problems by title
 *     tags: [Problems]
 */
router.get('/search', controller.searchProblems);

/**
 * @swagger
 * /api/v1/problems/stats:
 *   get:
 *     summary: Get problem statistics
 *     tags: [Problems]
 */
router.get('/stats', controller.getStatistics);

/**
 * @swagger
 * /api/v1/problems/{id}:
 *   get:
 *     summary: Get single problem by ID or slug
 *     tags: [Problems]
 */
router.get('/:id', controller.getProblem);

// ============================================
// PROTECTED ROUTES (require authentication)
// ============================================

/**
 * @swagger
 * /api/v1/problems:
 *   post:
 *     summary: Create new problem (admin only)
 *     tags: [Problems]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authenticate, controller.createProblem);

/**
 * @swagger
 * /api/v1/problems/{id}:
 *   put:
 *     summary: Update problem (admin only)
 *     tags: [Problems]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', authenticate, controller.updateProblem);

/**
 * @swagger
 * /api/v1/problems/{id}:
 *   delete:
 *     summary: Delete problem (admin only)
 *     tags: [Problems]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', authenticate, controller.deleteProblem);

export default router;