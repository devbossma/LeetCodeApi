import { GraphQLError } from 'graphql';
import { ProblemService } from '../../services/problem.service';
import { type GraphQLContext } from '../context';

const problemService = new ProblemService();

export const problemResolvers = {
    Query: {
        // Get paginated problems
        problems: async (
            _: any,
            { page = 1, limit = 20, filters }: any,
            context: GraphQLContext
        ) => {
            try {
                return await problemService.getProblems(page, limit, filters);
            } catch (error) {
                throw new GraphQLError('Failed to fetch problems', {
                    extensions: { code: 'INTERNAL_SERVER_ERROR' },
                });
            }
        },

        // Get single problem by ID
        problem: async (_: any, { id }: { id: number }, context: GraphQLContext) => {
            try {
                const problem = await problemService.getProblem(id);
                if (!problem) {
                    throw new GraphQLError('Problem not found', {
                        extensions: { code: 'NOT_FOUND' },
                    });
                }
                return problem;
            } catch (error) {
                throw error;
            }
        },

        // Get problem by slug
        problemBySlug: async (_: any, { slug }: { slug: string }, context: GraphQLContext) => {
            try {
                const problem = await problemService.getProblem(slug);
                if (!problem) {
                    throw new GraphQLError('Problem not found', {
                        extensions: { code: 'NOT_FOUND' },
                    });
                }
                return problem;
            } catch (error) {
                throw error;
            }
        },

        // Search problems
        searchProblems: async (_: any, { query }: { query: string }, context: GraphQLContext) => {
            try {
                if (!query || query.trim().length === 0) {
                    throw new GraphQLError('Search query is required', {
                        extensions: { code: 'BAD_USER_INPUT' },
                    });
                }
                return await problemService.searchProblems(query);
            } catch (error) {
                throw error;
            }
        },

        // Get problems by difficulty
        problemsByDifficulty: async (
            _: any,
            { difficulty }: { difficulty: string },
            context: GraphQLContext
        ) => {
            try {
                return await problemService.getProblemsByDifficulty(difficulty);
            } catch (error) {
                throw new GraphQLError('Failed to fetch problems by difficulty', {
                    extensions: { code: 'INTERNAL_SERVER_ERROR' },
                });
            }
        },

        // Get problems by topic
        problemsByTopic: async (_: any, { topic }: { topic: string }, context: GraphQLContext) => {
            try {
                return await problemService.getProblemsByTopic(topic);
            } catch (error) {
                throw new GraphQLError('Failed to fetch problems by topic', {
                    extensions: { code: 'INTERNAL_SERVER_ERROR' },
                });
            }
        },

        // Get statistics
        problemStatistics: async (_: any, __: any, context: GraphQLContext) => {
            try {
                return await problemService.getStatistics();
            } catch (error) {
                throw new GraphQLError('Failed to fetch statistics', {
                    extensions: { code: 'INTERNAL_SERVER_ERROR' },
                });
            }
        },
    },

    Mutation: {
        // Create problem (requires authentication)
        createProblem: async (_: any, { input }: any, context: GraphQLContext) => {
            // Check authentication
            if (!context.user) {
                throw new GraphQLError('Authentication required', {
                    extensions: { code: 'UNAUTHENTICATED' },
                });
            }

            try {
                return await problemService.createProblem(input);
            } catch (error) {
                throw new GraphQLError('Failed to create problem', {
                    extensions: { code: 'INTERNAL_SERVER_ERROR' },
                });
            }
        },

        // Update problem (requires authentication)
        updateProblem: async (_: any, { id, input }: any, context: GraphQLContext) => {
            if (!context.user) {
                throw new GraphQLError('Authentication required', {
                    extensions: { code: 'UNAUTHENTICATED' },
                });
            }

            try {
                const problem = await problemService.updateProblem(id, input);
                if (!problem) {
                    throw new GraphQLError('Problem not found', {
                        extensions: { code: 'NOT_FOUND' },
                    });
                }
                return problem;
            } catch (error) {
                throw error;
            }
        },

        // Delete problem (requires authentication)
        deleteProblem: async (_: any, { id }: { id: number }, context: GraphQLContext) => {
            if (!context.user) {
                throw new GraphQLError('Authentication required', {
                    extensions: { code: 'UNAUTHENTICATED' },
                });
            }

            try {
                const deleted = await problemService.deleteProblem(id);
                if (!deleted) {
                    throw new GraphQLError('Problem not found', {
                        extensions: { code: 'NOT_FOUND' },
                    });
                }
                return true;
            } catch (error) {
                throw error;
            }
        },
    },
};