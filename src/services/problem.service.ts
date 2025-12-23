// NOTE: Prisma Client is generated into `src/generated/prisma` (see prisma/schema.prisma).
// Import model types from the generated client output rather than from `@prisma/client`.
import type { Problem, Prisma } from '../generated/prisma/client.js';
import { ProblemRepository } from '../repositories/problem.repository';
import { cache } from '../config/redis.js';
import { type ProblemFilters, type PaginatedResponse } from '../types/index';

export class ProblemService {
    private repository: ProblemRepository;

    constructor() {
        this.repository = new ProblemRepository();
    }

    /**
     * Get paginated list of problems with filters and caching
     */
    async getProblems(
        page: number = 1,
        limit: number = 20,
        filters?: ProblemFilters
    ): Promise<PaginatedResponse<Problem>> {
        // Create cache key based on params
        const cacheKey = `problems:page:${page}:limit:${limit}:${JSON.stringify(filters || {})}`;

        // Check cache first
        const cached = await cache.get<PaginatedResponse<Problem>>(cacheKey);
        if (cached) {
            return cached;
        }

        // Fetch from database
        const [problems, total] = await Promise.all([
            this.repository.findMany(page, limit, filters),
            this.repository.count(filters),
        ]);

        const response: PaginatedResponse<Problem> = {
            data: problems,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };

        // Cache for 5 minutes
        await cache.set(cacheKey, response, 300);

        return response;
    }

    /**
     * Get single problem by ID or slug
     */
    async getProblem(identifier: number | string): Promise<Problem | null> {
        const cacheKey = `problem:${identifier}`;

        // Check cache
        const cached = await cache.get<Problem>(cacheKey);
        if (cached) {
            return cached;
        }

        // Fetch from database
        const problem = typeof identifier === 'number'
            ? await this.repository.findById(identifier)
            : await this.repository.findBySlug(identifier);

        if (problem) {
            // Cache for 10 minutes
            await cache.set(cacheKey, problem, 600);
        }

        return problem;
    }

    /**
     * Create new problem (admin only)
     */
    async createProblem(data: Prisma.ProblemCreateInput): Promise<Problem> {
        const problem = await this.repository.create(data);

        // Invalidate list cache
        await cache.delPattern('problems:*');

        return problem;
    }

    /**
     * Update existing problem (admin only)
     */
    async updateProblem(id: number, data: Prisma.ProblemUpdateInput): Promise<Problem | null> {
        const problem = await this.repository.update(id, data);

        if (problem) {
            // Invalidate caches
            await cache.del(`problem:${id}`);
            await cache.del(`problem:${problem.titleSlug}`);
            await cache.delPattern('problems:*');
        }

        return problem;
    }

    /**
     * Delete problem (admin only)
     */
    async deleteProblem(id: number): Promise<boolean> {
        const problem = await this.repository.findById(id);

        if (problem) {
            await this.repository.delete(id);

            // Invalidate caches
            await cache.del(`problem:${id}`);
            await cache.del(`problem:${problem.titleSlug}`);
            await cache.delPattern('problems:*');

            return true;
        }

        return false;
    }

    /**
     * Get problems by difficulty
     */
    async getProblemsByDifficulty(difficulty: string): Promise<Problem[]> {
        const cacheKey = `problems:difficulty:${difficulty}`;

        const cached = await cache.get<Problem[]>(cacheKey);
        if (cached) {
            return cached;
        }

        const problems = await this.repository.findByDifficulty(difficulty);
        await cache.set(cacheKey, problems, 600);

        return problems;
    }

    /**
     * Get problems by topic
     */
    async getProblemsByTopic(topic: string): Promise<Problem[]> {
        const cacheKey = `problems:topic:${topic}`;

        const cached = await cache.get<Problem[]>(cacheKey);
        if (cached) {
            return cached;
        }

        const problems = await this.repository.findByTopic(topic);
        await cache.set(cacheKey, problems, 600);

        return problems;
    }

    /**
     * Search problems by title
     */
    async searchProblems(query: string): Promise<Problem[]> {
        const cacheKey = `problems:search:${query}`;

        const cached = await cache.get<Problem[]>(cacheKey);
        if (cached) {
            return cached;
        }

        const problems = await this.repository.search(query);
        await cache.set(cacheKey, problems, 300);

        return problems;
    }

    /**
     * Get statistics
     */
    async getStatistics() {
        const cacheKey = 'problems:stats';

        const cached = await cache.get(cacheKey);
        if (cached) {
            return cached;
        }

        const stats = await this.repository.getStatistics();
        await cache.set(cacheKey, stats, 600);

        return stats;
    }
}
