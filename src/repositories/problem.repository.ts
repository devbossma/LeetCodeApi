import type { Problem, Prisma } from '../generated/prisma/client.js';
import { prisma } from '../config/database';
import { type ProblemFilters } from '../types/index.js';

export class ProblemRepository {
    /**
     * Find many problems with pagination and filters
     */
    async findMany(
        page: number = 1,
        limit: number = 20,
        filters?: ProblemFilters
    ): Promise<Problem[]> {
        const skip = (page - 1) * limit;

        const where: Prisma.ProblemWhereInput = {};

        // Apply filters
        if (filters?.difficulty) {
            where.difficulty = filters.difficulty;
        }

        if (filters?.topic) {
            where.topics = {
                has: filters.topic,
            };
        }

        if (filters?.search) {
            where.OR = [
                { title: { contains: filters.search, mode: 'insensitive' } },
                { titleSlug: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        return prisma.problem.findMany({
            where,
            skip,
            take: limit,
            orderBy: { id: 'asc' },
        });
    }

    /**
     * Count problems with filters
     */
    async count(filters?: ProblemFilters): Promise<number> {
        const where: Prisma.ProblemWhereInput = {};

        if (filters?.difficulty) {
            where.difficulty = filters.difficulty;
        }

        if (filters?.topic) {
            where.topics = {
                has: filters.topic,
            };
        }

        if (filters?.search) {
            where.OR = [
                { title: { contains: filters.search, mode: 'insensitive' } },
                { titleSlug: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        return prisma.problem.count({ where });
    }

    /**
     * Find problem by ID
     */
    async findById(id: number): Promise<Problem | null> {
        return prisma.problem.findUnique({
            where: { id },
        });
    }

    /**
     * Find problem by slug
     */
    async findBySlug(slug: string): Promise<Problem | null> {
        return prisma.problem.findUnique({
            where: { titleSlug: slug },
        });
    }

    /**
     * Find problems by difficulty
     */
    async findByDifficulty(difficulty: string): Promise<Problem[]> {
        return prisma.problem.findMany({
            where: { difficulty },
            orderBy: { id: 'asc' },
        });
    }

    /**
     * Find problems by topic
     */
    async findByTopic(topic: string): Promise<Problem[]> {
        return prisma.problem.findMany({
            where: {
                topics: {
                    has: topic,
                },
            },
            orderBy: { id: 'asc' },
        });
    }

    /**
     * Search problems by title
     */
    async search(query: string): Promise<Problem[]> {
        return prisma.problem.findMany({
            where: {
                OR: [
                    { title: { contains: query, mode: 'insensitive' } },
                    { titleSlug: { contains: query, mode: 'insensitive' } },
                ],
            },
            take: 50, // Limit search results
            orderBy: { likes: 'desc' },
        });
    }

    /**
     * Create new problem
     */
    async create(data: Prisma.ProblemCreateInput): Promise<Problem> {
        return prisma.problem.create({
            data,
        });
    }

    /**
     * Update problem
     */
    async update(id: number, data: Prisma.ProblemUpdateInput): Promise<Problem | null> {
        try {
            return await prisma.problem.update({
                where: { id },
                data,
            });
        } catch (error) {
            return null;
        }
    }

    /**
     * Delete problem
     */
    async delete(id: number): Promise<boolean> {
        try {
            await prisma.problem.delete({
                where: { id },
            });
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get statistics
     */
    async getStatistics() {
        const [total, easy, medium, hard] = await Promise.all([
            prisma.problem.count(),
            prisma.problem.count({ where: { difficulty: 'Easy' } }),
            prisma.problem.count({ where: { difficulty: 'Medium' } }),
            prisma.problem.count({ where: { difficulty: 'Hard' } }),
        ]);

        // Get unique topics
        const problems = await prisma.problem.findMany({
            select: { topics: true },
        });

        const allTopics = problems.flatMap(p => p.topics);
        const uniqueTopics = [...new Set(allTopics)];

        return {
            total,
            byDifficulty: {
                easy,
                medium,
                hard,
            },
            totalTopics: uniqueTopics.length,
            topics: uniqueTopics,
        };
    }

    /**
     * Get multiple problems by IDs (for DataLoader)
     */
    async findByIds(ids: number[]): Promise<Problem[]> {
        return prisma.problem.findMany({
            where: {
                id: {
                    in: ids,
                },
            },
        });
    }
}
