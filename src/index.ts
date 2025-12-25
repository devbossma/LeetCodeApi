import 'dotenv/config';
import express, { type Express, type Request, type Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createYoga } from 'graphql-yoga';

// Config
import { testConnection } from './config/database.js';
import { testRedisConnection } from './config/redis.js';

// REST API Routes (v1)
import apiV1Routes from './api/v1/routes/index.js';

// GraphQL
import { schema } from './graphql/schema/index.js';
import { createGraphQLContext } from './graphql/context.js';

// Middleware
import { errorHandler } from './middleware/errorHandler.js';

// Swagger
import { setupSwagger } from './config/swagger.js';

const app: Express = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARE
// ============================================
app.use(helmet({
    contentSecurityPolicy: process.env.APP_MODE === 'production' ? undefined : false,
    crossOriginEmbedderPolicy: false,
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// HEALTH CHECK
// ============================================
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

// ============================================
// REST API v1
// ============================================
app.use('/api/v1', apiV1Routes);

// ============================================
// GRAPHQL API
// ============================================
const yoga = createYoga({
    schema,
    context: createGraphQLContext,
    graphqlEndpoint: '/graphql',
    // Enable GraphiQL in development
    graphiql: process.env.NODE_ENV !== 'production',
    // Disable introspection in production
    maskedErrors: process.env.NODE_ENV === 'production',
});

app.use('/graphql', yoga);

// ============================================
// SWAGGER DOCUMENTATION (REST API only)
// ============================================
setupSwagger(app);

// ============================================
// ERROR HANDLING
// ============================================
app.use(errorHandler);

// ============================================
// 404 HANDLER
// ============================================
app.use('/{*any}', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
        path: req.originalUrl,
    });
});

// ============================================
// START SERVER
// ============================================
async function startServer() {
    try {
        // Test database connection
        await testConnection();

        // Test Redis connection
        await testRedisConnection();

        app.listen(PORT, () => {
            console.log('\n🚀 Server is running!');
            console.log(`📍 Port: ${PORT}`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log('\n📡 Available endpoints:');
            console.log(`   REST API v1: http://localhost:${PORT}/api/v1`);
            console.log(`   GraphQL:     http://localhost:${PORT}/graphql`);
            console.log(`   Swagger:     http://localhost:${PORT}/api-docs`);
            console.log(`   Health:      http://localhost:${PORT}/health`);
            console.log('\n');
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('\n👋 SIGTERM received, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\n👋 SIGINT received, shutting down gracefully...');
    process.exit(0);
});