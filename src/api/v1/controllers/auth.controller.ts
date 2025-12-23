import { type Request, type Response, type NextFunction } from 'express';
import { AuthService } from '../../../services/auth.service.js';
import { type RegisterInput, type LoginInput } from '../../../types/index.js';

export class AuthController {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }

    /**
     * POST /api/v1/auth/register
     * Register new user
     */
    register = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const input: RegisterInput = req.body;

            // Validate input
            if (!input.username || !input.email || !input.password) {
                return res.status(400).json({
                    success: false,
                    error: 'Username, email, and password are required',
                });
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input.email)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid email format',
                });
            }

            const result = await this.authService.register(input);

            res.status(201).json({
                success: true,
                data: result,
                message: 'User registered successfully',
            });
        } catch (error: any) {
            // Handle specific errors
            if (error.message.includes('already exists') || error.message.includes('already taken')) {
                return res.status(409).json({
                    success: false,
                    error: error.message,
                });
            }

            if (error.message.includes('Password must be')) {
                return res.status(400).json({
                    success: false,
                    error: error.message,
                });
            }

            next(error);
        }
    };

    /**
     * POST /api/v1/auth/login
     * Login user
     */
    login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const input: LoginInput = req.body;

            // Validate input
            if (!input.email || !input.password) {
                return res.status(400).json({
                    success: false,
                    error: 'Email and password are required',
                });
            }

            const result = await this.authService.login(input);

            res.json({
                success: true,
                data: result,
                message: 'Login successful',
            });
        } catch (error: any) {
            if (error.message === 'Invalid email or password') {
                return res.status(401).json({
                    success: false,
                    error: error.message,
                });
            }

            next(error);
        }
    };

    /**
     * GET /api/v1/auth/me
     * Get current user (requires authentication)
     */
    getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: 'Not authenticated',
                });
            }

            const user = await this.authService.getUserById(req.user.userId);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found',
                });
            }

            res.json({
                success: true,
                data: user,
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * POST /api/v1/auth/change-password
     * Change password (requires authentication)
     */
    changePassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: 'Not authenticated',
                });
            }

            const { currentPassword, newPassword } = req.body;

            if (!currentPassword || !newPassword) {
                return res.status(400).json({
                    success: false,
                    error: 'Current password and new password are required',
                });
            }

            await this.authService.changePassword(
                req.user.userId,
                currentPassword,
                newPassword
            );

            res.json({
                success: true,
                message: 'Password changed successfully',
            });
        } catch (error: any) {
            if (error.message.includes('incorrect') || error.message.includes('must be')) {
                return res.status(400).json({
                    success: false,
                    error: error.message,
                });
            }

            next(error);
        }
    };

    /**
     * POST /api/v1/auth/verify
     * Verify JWT token
     */
    verifyToken = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { token } = req.body;

            if (!token) {
                return res.status(400).json({
                    success: false,
                    error: 'Token is required',
                });
            }

            const payload = this.authService.verifyToken(token);

            res.json({
                success: true,
                data: payload,
                message: 'Token is valid',
            });
        } catch (error: any) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired token',
            });
        }
    };
}