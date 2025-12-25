import { z } from 'zod';

/**
 * Difficulty enum
 */
export const difficultyEnum = z.enum(['Easy', 'Medium', 'Hard']);

/**
 * Create problem validation schema
 */
export const createProblemSchema = z.object({
    frontendQuestionId: z.string().optional(),

    title: z
        .string()
        .min(1, 'Title is required')
        .max(200, 'Title must not exceed 200 characters'),

    titleSlug: z
        .string()
        .min(1, 'Title slug is required')
        .max(200, 'Title slug must not exceed 200 characters')
        .regex(/^[a-z0-9-]+$/, 'Title slug can only contain lowercase letters, numbers, and hyphens'),

    difficulty: difficultyEnum,

    paidOnly: z.boolean().default(false),

    url: z.string().url('Invalid URL').optional(),
    descriptionUrl: z.string().url('Invalid URL').optional(),
    solutionUrl: z.string().url('Invalid URL').optional(),
    solutionCodeUrl: z.string().url('Invalid URL').optional(),

    description: z.string().optional(),
    solution: z.string().optional(),

    solutionCodePython: z.string().optional(),
    solutionCodeJava: z.string().optional(),
    solutionCodeCpp: z.string().optional(),

    category: z.string().default('Algorithms'),
    acceptanceRate: z.number().min(0).max(100).optional(),

    topics: z.array(z.string()).default([]),
    hints: z.array(z.string()).default([]),

    likes: z.number().int().min(0).default(0),
    dislikes: z.number().int().min(0).default(0),

    totalAccepted: z.string().optional(),
    totalSubmission: z.string().optional(),

    similarQuestions: z.any().optional(),
});

/**
 * Update problem validation schema (all fields optional)
 */
export const updateProblemSchema = createProblemSchema.partial();

/**
 * Query parameters validation
 */
export const problemQuerySchema = z.object({
    page: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 1))
        .refine((val) => val > 0, 'Page must be greater than 0'),

    limit: z
        .string()
        .optional()
        .transform((val) => (val ? Math.min(parseInt(val, 10), 100) : 20))
        .refine((val) => val > 0 && val <= 100, 'Limit must be between 1 and 100'),

    difficulty: difficultyEnum.optional(),

    topic: z.string().optional(),

    search: z.string().optional(),
});

/**
 * Search query validation
 */
export const searchQuerySchema = z.object({
    q: z
        .string()
        .min(1, 'Search query is required')
        .max(100, 'Search query must not exceed 100 characters'),
});

/**
 * ID parameter validation
 */
export const idParamSchema = z.object({
    id: z
        .string()
        .regex(/^\d+$/, 'ID must be a number')
        .transform((val) => parseInt(val, 10)),
});

// Export types
export type CreateProblemInput = z.infer<typeof createProblemSchema>;
export type UpdateProblemInput = z.infer<typeof updateProblemSchema>;
export type ProblemQueryParams = z.infer<typeof problemQuerySchema>;
export type SearchQueryParams = z.infer<typeof searchQuerySchema>;
export type IdParam = z.infer<typeof idParamSchema>;