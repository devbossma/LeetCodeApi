import { type YogaInitialContext } from 'graphql-yoga';
import jwt from 'jsonwebtoken';
import { type JWTPayload } from '../types/index.js';

export interface GraphQLContext extends YogaInitialContext {
    user?: JWTPayload;
}

/**
 * Create GraphQL context for each request
 * Extracts and verifies JWT token from Authorization header
 */
export async function createGraphQLContext(
    initialContext: YogaInitialContext
): Promise<GraphQLContext> {
    const context: GraphQLContext = {
        ...initialContext,
    };

    // Extract token from Authorization header
    const authHeader = initialContext.request.headers.get('authorization');

    if (authHeader) {
        const token = authHeader.replace('Bearer ', '');

        try {
            // Verify and decode JWT
            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET || 'your-secret-key'
            ) as JWTPayload;

            context.user = decoded;
        } catch (error) {
            // Token is invalid or expired So We don't throw error here, just don't set user.
            // This allows public queries to work
            console.log('Invalid token:', error);
        }
    }

    return context;
}