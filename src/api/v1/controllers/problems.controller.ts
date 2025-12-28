import { type Request, type Response, type NextFunction } from 'express';
import { ProblemService } from '../../../services/problem.service.js';
import { type ProblemFilters } from '../../../types/index.js';

export class ProblemController {
    private service: ProblemService;

    constructor() {
        this.service = new ProblemService();
    }

    /**
     * GET /api/v1/problems
     * Get paginated list of problems
     */
    getProblems = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = Math.min(parseInt(req.query.limit as string) || 20, 20);

            const filters: ProblemFilters = {
                difficulty: req.query.difficulty as any,
                topic: req.query.topic as string,
                search: req.query.search as string,
            };

            const result = await this.service.getProblems(page, limit, filters);

            res.json({
                success: true,
                ...result,
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/v1/problems/:id
     * Get single problem by ID or slug
     */
    getProblem = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const identifier = isNaN(Number(req.params.id))
                ? req.params.id
                : parseInt(req.params.id);

            const problem = await this.service.getProblem(identifier);

            if (!problem) {
                return res.status(404).json({
                    success: false,
                    error: 'Problem not found',
                });
            }

            res.json({
                success: true,
                data: problem,
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/v1/problems/search
     * Search problems
     */
    searchProblems = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const query = req.query.q as string;

            if (!query) {
                return res.status(400).json({
                    success: false,
                    error: 'Search query is required',
                });
            }

            const problems = await this.service.searchProblems(query);

            res.json({
                success: true,
                data: problems,
                count: problems.length,
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/v1/problems/stats
     * Get statistics
     */
    getStatistics = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const stats = await this.service.getStatistics();

            res.json({
                success: true,
                data: stats,
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * POST /api/v1/problems
     * Create new problem (admin only)
     * Note: Validation is handled by middleware
     */
    createProblem = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const problem = await this.service.createProblem(req.body);

            res.status(201).json({
                success: true,
                data: problem,
                message: 'Problem created successfully',
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * PUT /api/v1/problems/:id
     * Update problem (admin only)
     */
    updateProblem = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(req.params.id);
            const problem = await this.service.updateProblem(id, req.body);

            if (!problem) {
                return res.status(404).json({
                    success: false,
                    error: 'Problem not found',
                });
            }

            res.json({
                success: true,
                data: problem,
                message: 'Problem updated successfully',
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * DELETE /api/v1/problems/:id
     * Delete problem (admin only)
     */
    deleteProblem = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(req.params.id);
            const deleted = await this.service.deleteProblem(id);

            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    error: 'Problem not found',
                });
            }

            res.json({
                success: true,
                message: 'Problem deleted successfully',
            });
        } catch (error) {
            next(error);
        }
    };
}