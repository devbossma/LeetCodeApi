import { User } from '@prisma/client';

// Extend Express Request to include user from JWT
declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: number;
                email: string;
                iat?: number;
                exp?: number;
            };
        }
    }
}

export { };