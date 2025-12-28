import { Router } from 'express';
import { ProblemController } from '../controllers/problems.controller.js';
import { authenticate } from '../../../middleware/auth.middleware.js';
import { validate, validateMultiple } from '../../../middleware/validation.middleware.js';
import {
    createProblemSchema,
    updateProblemSchema,
    problemQuerySchema,
    searchQuerySchema,
    idParamSchema,
} from '../validators/problems.validator.js';

const router = Router();
const controller = new ProblemController();

/**
 * @swagger
 * components:
 *   schemas:
 *     Problem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         frontendQuestionId:
 *           type: string
 *           example: "1"
 *         title:
 *           type: string
 *           example: Two Sum
 *         titleSlug:
 *           type: string
 *           example: two-sum
 *         difficulty:
 *           type: string
 *           enum: [Easy, Medium, Hard]
 *           example: Easy
 *         paidOnly:
 *           type: boolean
 *           example: false
 *         url:
 *           type: string
 *           example: https://leetcode.com/problems/two-sum
 *         description:
 *           type: string
 *         topics:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Array", "Hash Table"]
 *         hints:
 *           type: array
 *           items:
 *             type: string
 *         likes:
 *           type: integer
 *           example: 1000
 *         dislikes:
 *           type: integer
 *           example: 50
 *         acceptanceRate:
 *           type: number
 *           format: float
 *           example: 55.5
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     
 *     PaginatedProblems:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Problem'
 *         pagination:
 *           type: object
 *           properties:
 *             page:
 *               type: integer
 *               example: 1
 *             limit:
 *               type: integer
 *               example: 20
 *             total:
 *               type: integer
 *               example: 1000
 *             totalPages:
 *               type: integer
 *               example: 50
 *     
 *     CreateProblemInput:
 *       type: object
 *       required:
 *         - title
 *         - titleSlug
 *         - difficulty
 *       properties:
 *         frontendQuestionId:
 *           type: string
 *         title:
 *           type: string
 *           minLength: 1
 *           maxLength: 200
 *           example: Two Sum
 *         titleSlug:
 *           type: string
 *           pattern: '^[a-z0-9-]+$'
 *           example: two-sum
 *         difficulty:
 *           type: string
 *           enum: [Easy, Medium, Hard]
 *           example: Easy
 *         paidOnly:
 *           type: boolean
 *           default: false
 *         description:
 *           type: string
 *         topics:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Array", "Hash Table"]
 *         hints:
 *           type: array
 *           items:
 *             type: string
 *         likes:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         dislikes:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *     
 *     UpdateProblemInput:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         titleSlug:
 *           type: string
 *         difficulty:
 *           type: string
 *           enum: [Easy, Medium, Hard]
 *         description:
 *           type: string
 *         topics:
 *           type: array
 *           items:
 *             type: string
 *         hints:
 *           type: array
 *           items:
 *             type: string
 *     
 *     ProblemStatistics:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *               example: 1000
 *             byDifficulty:
 *               type: object
 *               properties:
 *                 easy:
 *                   type: integer
 *                   example: 300
 *                 medium:
 *                   type: integer
 *                   example: 500
 *                 hard:
 *                   type: integer
 *                   example: 200
 *             totalTopics:
 *               type: integer
 *               example: 50
 *             topics:
 *               type: array
 *               items:
 *                 type: string
 */

/**
 * @swagger
 * /api/v1/problems:
 *   get:
 *     summary: Get paginated list of problems
 *     description: Retrieve a paginated list of problems with optional filters
 *     tags: [Problems]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Items per page (max 100)
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [Easy, Medium, Hard]
 *         description: Filter by difficulty
 *       - in: query
 *         name: topic
 *         schema:
 *           type: string
 *         description: Filter by topic (e.g., "Array", "Dynamic Programming")
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedProblems'
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 */
router.get('/', validate(problemQuerySchema, 'query'), controller.getProblems);

/**
 * @swagger
 * /api/v1/problems/search:
 *   get:
 *     summary: Search problems by title
 *     description: Search for problems matching the query string
 *     tags: [Problems]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *         description: Search query
 *         example: two sum
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Problem'
 *                 count:
 *                   type: integer
 *       400:
 *         description: Search query is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 */
router.get('/search', validate(searchQuerySchema, 'query'), controller.searchProblems);

/**
 * @swagger
 * /api/v1/problems/stats:
 *   get:
 *     summary: Get problem statistics
 *     description: Get statistics about problems including counts by difficulty and topics
 *     tags: [Problems]
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProblemStatistics'
 */
router.get('/stats', controller.getStatistics);

/**
 * @swagger
 * /api/v1/problems/{id}:
 *   get:
 *     summary: Get single problem by ID or slug
 *     description: Retrieve detailed information about a specific problem
 *     tags: [Problems]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Problem ID (number) or slug (string)
 *         example: 1
 *     responses:
 *       200:
 *         description: Problem found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Problem'
 *       404:
 *         description: Problem not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 *     description: Create a new problem in the database (requires authentication)
 *     tags: [Problems]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProblemInput'
 *     responses:
 *       201:
 *         description: Problem created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Problem'
 *                 message:
 *                   type: string
 *                   example: Problem created successfully
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', authenticate, validate(createProblemSchema), controller.createProblem);

/**
 * @swagger
 * /api/v1/problems/{id}:
 *   put:
 *     summary: Update problem (admin only)
 *     description: Update an existing problem (requires authentication)
 *     tags: [Problems]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Problem ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProblemInput'
 *     responses:
 *       200:
 *         description: Problem updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Problem'
 *                 message:
 *                   type: string
 *                   example: Problem updated successfully
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Problem not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put(
    '/:id',
    authenticate,
    validateMultiple({ params: idParamSchema, body: updateProblemSchema }),
    controller.updateProblem
);

/**
 * @swagger
 * /api/v1/problems/{id}:
 *   delete:
 *     summary: Delete problem (admin only)
 *     description: Delete a problem from the database (requires authentication)
 *     tags: [Problems]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Problem ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Problem deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Problem deleted successfully
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Problem not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', authenticate, validate(idParamSchema, 'params'), controller.deleteProblem);

export default router;