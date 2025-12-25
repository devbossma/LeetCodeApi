import type { DateTimeFilter } from "@/generated/prisma/commonInputTypes";

// API Response types
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T = any> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// Query parameters
export interface PaginationQuery {
    page?: string;
    limit?: string;
}

export interface ProblemFilters extends PaginationQuery {
    difficulty?: 'Easy' | 'Medium' | 'Hard';
    topic?: string;
    search?: string;
}

// Auth types
export interface RegisterInput {
    username: string;
    email: string;
    password: string;
}

export interface LoginInput {
    email: string;
    password: string;
}

export interface JWTPayload {
    userId: number;
    email: string;
}

export interface AuthResponse {
    token: string;
    user: {
        id: number;
        username: string;
        email: string;
        createdAt: Date
        updatedAt: Date
    };
}

// Problem types (extend Prisma types if needed)
export interface CreateProblemInput {
    title: string;
    titleSlug: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    description?: string;
    topics?: string[];
    hints?: string[];
}

export interface UpdateProblemInput extends Partial<CreateProblemInput> {
    id: number;
}