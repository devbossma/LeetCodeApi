import { type User, Prisma } from '../generated/prisma/client.js';
import { prisma } from '../config/database.js';

export class UserRepository {
    /**
     * Create new user
     */
    async create(data: Prisma.UserCreateInput): Promise<User> {
        return prisma.user.create({
            data,
        });
    }

    /**
     * Find user by ID
     */
    async findById(id: number): Promise<User | null> {
        return prisma.user.findUnique({
            where: { id },
        });
    }

    /**
     * Find user by email
     */
    async findByEmail(email: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: { email },
        });
    }

    /**
     * Find user by username
     */
    async findByUsername(username: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: { username },
        });
    }

    /**
     * Update user
     */
    async update(id: number, data: Prisma.UserUpdateInput): Promise<User> {
        return prisma.user.update({
            where: { id },
            data,
        });
    }

    /**
     * Update password
     */
    async updatePassword(id: number, hashedPassword: string): Promise<User> {
        return prisma.user.update({
            where: { id },
            data: { password: hashedPassword },
        });
    }

    /**
     * Delete user
     */
    async delete(id: number): Promise<User> {
        return prisma.user.delete({
            where: { id },
        });
    }

    /**
     * Get all users (admin only)
     */
    async findAll(): Promise<Omit<User, 'password'>[]> {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                email: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        return users;
    }

    /**
     * Count total users
     */
    async count(): Promise<number> {
        return prisma.user.count();
    }
}