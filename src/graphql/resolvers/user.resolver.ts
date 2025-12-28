import { GraphQLError } from 'graphql';
import { AuthService } from '../../services/auth.service.js';
import { type GraphQLContext } from '../context.js';
import { type RegisterInput, type LoginInput } from '../../types/index.js';

const authService = new AuthService();

export const userResolvers = {
    Query: {
        /**
         * Get current authenticated user
         */
        me: async (_: any, __: any, context: GraphQLContext) => {
            if (!context.user) {
                throw new GraphQLError('Authentication required', {
                    extensions: { code: 'UNAUTHENTICATED' },
                });
            }

            try {
                const user = await authService.getUserById(context.user.userId);

                if (!user) {
                    throw new GraphQLError('User not found', {
                        extensions: { code: 'NOT_FOUND' },
                    });
                }

                return user;
            } catch (error) {
                throw error;
            }
        },
    },

    Mutation: {
        /**
         * Register new user
         */
        register: async (
            _: any,
            { input }: { input: RegisterInput },
            context: GraphQLContext
        ) => {
            try {
                // Validate input
                if (!input.username || !input.email || !input.password) {
                    throw new GraphQLError('Username, email, and password are required', {
                        extensions: { code: 'BAD_USER_INPUT' },
                    });
                }

                // Email validation
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(input.email)) {
                    throw new GraphQLError('Invalid email format', {
                        extensions: { code: 'BAD_USER_INPUT' },
                    });
                }

                const result = await authService.register(input);
                return result;
            } catch (error: any) {
                if (error instanceof GraphQLError) {
                    throw error;
                }

                // Handle specific errors
                if (error.message.includes('already exists') || error.message.includes('already taken')) {
                    throw new GraphQLError(error.message, {
                        extensions: { code: 'CONFLICT' },
                    });
                }

                if (error.message.includes('Password must be')) {
                    throw new GraphQLError(error.message, {
                        extensions: { code: 'BAD_USER_INPUT' },
                    });
                }

                throw new GraphQLError('Registration failed', {
                    extensions: { code: 'INTERNAL_SERVER_ERROR' },
                });
            }
        },

        /**
         * Login user
         */
        login: async (
            _: any,
            { input }: { input: LoginInput },
            context: GraphQLContext
        ) => {
            try {
                // Validate input
                if (!input.email || !input.password) {
                    throw new GraphQLError('Email and password are required', {
                        extensions: { code: 'BAD_USER_INPUT' },
                    });
                }

                const result = await authService.login(input);
                return result;
            } catch (error: any) {
                if (error instanceof GraphQLError) {
                    throw error;
                }

                if (error.message === 'Invalid email or password') {
                    throw new GraphQLError('Invalid email or password', {
                        extensions: { code: 'UNAUTHENTICATED' },
                    });
                }

                throw new GraphQLError('Login failed', {
                    extensions: { code: 'INTERNAL_SERVER_ERROR' },
                });
            }
        },
    },
};