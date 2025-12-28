import 'dotenv/config';
import { prisma } from '../lib/prisma.js';

// Test database connection
export async function testConnection(): Promise<void> {
    try {
        await prisma.$connect();
        console.log('✅ Database connected successfully');

        // Optional: Test query
        const count = await prisma.problem.count();
        console.log(`📊 Total problems in database: ${count}`);
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        throw error;
    }
}

// Graceful shutdown
export async function disconnect(): Promise<void> {
    await prisma.$disconnect();
    console.log('👋 Database disconnected');
}

// Handle cleanup on process exit
process.on('SIGINT', async () => {
    await disconnect();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    await disconnect();
    process.exit(0);
});

// Export prisma instance for use in other files
export { prisma };