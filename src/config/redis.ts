import 'dotenv/config';
import Redis from 'ioredis';

// Create Redis client with proper types
const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
    retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    maxRetriesPerRequest: 3,
    lazyConnect: true, // Don't connect immediately
});

// Connection events
redis.on('connect', () => {
    console.log('✅ Redis connected successfully');
});

redis.on('error', (err: Error) => {
    console.error('❌ Redis connection error:', err.message);
});

redis.on('ready', () => {
    console.log('✅ Redis is ready to accept commands');
});

redis.on('reconnecting', () => {
    console.log('🔄 Redis reconnecting...');
});

// Cache helper interface
interface CacheHelpers {
    get<T = any>(key: string): Promise<T | null>;
    set(key: string, value: any, expirationInSeconds?: number): Promise<boolean>;
    del(key: string): Promise<boolean>;
    delPattern(pattern: string): Promise<boolean>;
    exists(key: string): Promise<boolean>;
    ttl(key: string): Promise<number>;
}

// Helper functions with proper types
export const cache: CacheHelpers = {
    // Get cached data with generic type support
    async get<T = any>(key: string): Promise<T | null> {
        try {
            const data = await redis.get(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Redis GET error:', error);
            return null;
        }
    },

    // Set cache with expiration (default 5 minutes)
    async set(key: string, value: any, expirationInSeconds: number = 300): Promise<boolean> {
        try {
            await redis.setex(key, expirationInSeconds, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Redis SET error:', error);
            return false;
        }
    },

    // Delete cached data
    async del(key: string): Promise<boolean> {
        try {
            await redis.del(key);
            return true;
        } catch (error) {
            console.error('Redis DEL error:', error);
            return false;
        }
    },

    // Delete multiple keys by pattern
    async delPattern(pattern: string): Promise<boolean> {
        try {
            const keys = await redis.keys(pattern);
            if (keys.length > 0) {
                await redis.del(...keys);
            }
            return true;
        } catch (error) {
            console.error('Redis DELETE PATTERN error:', error);
            return false;
        }
    },

    // Check if key exists
    async exists(key: string): Promise<boolean> {
        try {
            const result = await redis.exists(key);
            return result === 1;
        } catch (error) {
            console.error('Redis EXISTS error:', error);
            return false;
        }
    },

    // Get TTL of a key
    async ttl(key: string): Promise<number> {
        try {
            return await redis.ttl(key);
        } catch (error) {
            console.error('Redis TTL error:', error);
            return -1;
        }
    }
};

// Test Redis connection
export async function testRedisConnection(): Promise<void> {
    try {
        await redis.connect();
        await redis.ping();
        console.log('✅ Redis ping successful');
    } catch (error) {
        console.error('❌ Redis ping failed:', error);
    }
}

// Graceful shutdown
export async function disconnectRedis(): Promise<void> {
    await redis.quit();
    console.log('👋 Redis disconnected');
}

export { redis };