import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { type User } from '../generated/prisma/client';

import { UserRepository } from '../repositories/user.repository';
import { type RegisterInput, type LoginInput, type AuthResponse, type JWTPayload } from '../types/index.js';

export class AuthService {
    private userRepository: UserRepository;
    private JWT_SECRET: string;
    private JWT_EXPIRES_IN: string;

    constructor() {
        this.userRepository = new UserRepository();
        this.JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
        this.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
    }

    /**
     * Register new user
     */
    async register(input: RegisterInput): Promise<AuthResponse> {
        const { username, email, password } = input;

        // Check if user already exists
        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser) {
            throw new Error('User with this email already exists');
        }

        const existingUsername = await this.userRepository.findByUsername(username);
        if (existingUsername) {
            throw new Error('Username already taken');
        }

        // Validate password strength
        if (password.length < 6) {
            throw new Error('Password must be at least 6 characters long');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await this.userRepository.create({
            username,
            email,
            password: hashedPassword,
        });

        // Generate JWT token
        const token = this.generateToken({
            userId: user.id,
            email: user.email,
        });

        return {
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
            },
        };
    }

    /**
     * Login user
     */
    async login(input: LoginInput): Promise<AuthResponse> {
        const { email, password } = input;

        // Find user by email
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new Error('Invalid email or password');
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            throw new Error('Invalid email or password');
        }

        // Generate JWT token
        const token = this.generateToken({
            userId: user.id,
            email: user.email,
        });

        return {
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
            },
        };
    }

    /**
     * Get user by ID
     */
    async getUserById(id: number): Promise<Omit<User, 'password'> | null> {
        const user = await this.userRepository.findById(id);
        if (!user) {
            return null;
        }

        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    /**
     * Verify JWT token
     */
    verifyToken(token: string): JWTPayload {
        try {
            return jwt.verify(token, this.JWT_SECRET) as JWTPayload;
        } catch (error) {
            throw new Error('Invalid or expired token');
        }
    }

    /**
   * Generate JWT token
   */
    private generateToken(payload: JWTPayload): string {
        return jwt.sign(
            payload,
            this.JWT_SECRET,
            { expiresIn: this.JWT_EXPIRES_IN } as jwt.SignOptions
        );
    }

    /**
     * Change password
     */
    async changePassword(
        userId: number,
        currentPassword: string,
        newPassword: string
    ): Promise<boolean> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Verify current password
        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) {
            throw new Error('Current password is incorrect');
        }

        // Validate new password
        if (newPassword.length < 6) {
            throw new Error('New password must be at least 6 characters long');
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await this.userRepository.updatePassword(userId, hashedPassword);

        return true;
    }
}