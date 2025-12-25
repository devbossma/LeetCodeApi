import { z } from 'zod';

/**
 * Register validation schema
 */
export const registerSchema = z.object({
    username: z
        .string()
        .min(3, 'Username must be at least 3 characters')
        .max(30, 'Username must not exceed 30 characters')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),

    email: z
        .string()
        .email('Invalid email format')
        .max(100, 'Email must not exceed 100 characters'),

    password: z
        .string()
        .min(6, 'Password must be at least 6 characters')
        .max(100, 'Password must not exceed 100 characters'),
});

/**
 * Login validation schema
 */
export const loginSchema = z.object({
    email: z
        .string()
        .email('Invalid email format'),

    password: z
        .string()
        .min(1, 'Password is required'),
});

/**
 * Change password validation schema
 */
export const changePasswordSchema = z.object({
    currentPassword: z
        .string()
        .min(1, 'Current password is required'),

    newPassword: z
        .string()
        .min(6, 'New password must be at least 6 characters')
        .max(100, 'New password must not exceed 100 characters'),
});

/**
 * Verify token validation schema
 */
export const verifyTokenSchema = z.object({
    token: z
        .string()
        .min(1, 'Token is required'),
});

// Export types
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type VerifyTokenInput = z.infer<typeof verifyTokenSchema>;