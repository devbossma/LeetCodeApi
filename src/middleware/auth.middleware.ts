import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { type JWTPayload } from '../types/index.js';

/**
 * Middleware to authenticate JWT tokens for REST API
 */
export const authenticate = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                error: 'No authorization header provided',
            });
        }

        // Extract token (format: "Bearer TOKEN")
        const token = authHeader.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'No token provided',
            });
        }

        // Verify token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'secret-key'
        ) as JWTPayload;

        // Attach user to request
        req.user = decoded;

        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({
                success: false,
                error: 'Token expired',
            });
        }

        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({
                success: false,
                error: 'Invalid token',
            });
        }

        return res.status(500).json({
            success: false,
            error: 'Authentication failed',
        });
    }
};

/**
 * Optional authentication - doesn't fail if no token
 * Useful for endpoints that work both with and without auth
 */
export const optionalAuth = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader) {
            const token = authHeader.replace('Bearer ', '');
            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET || 'your-secret-key'
            ) as JWTPayload;

            req.user = decoded;
        }

        next();
    } catch (error) {
        // Ignore errors, just don't set user
        next();
    }
};