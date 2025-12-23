import { type Express } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'LeetCode Problems API',
            version: '1.0.0',
            description: 'RESTful API for browsing and managing LeetCode problems with authentication and caching',
            contact: {
                name: 'API Support',
                email: 'ysaber201@gmail.com',
            },
        },
        servers: [
            {
                // Development host url
                url: `http://${process.env.APP_HOST || 'localhost'}:${process.env.APP_PORT || 3000}`,
                description: 'Development server',
            },
            {
                // Production host url
                url: `http://${process.env.APP_HOST || 'localhost'}`,
                description: 'Production server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter your JWT token',
                },
            },
            schemas: {
                Problem: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        title: { type: 'string' },
                        titleSlug: { type: 'string' },
                        difficulty: { type: 'string', enum: ['Easy', 'Medium', 'Hard'] },
                        topics: { type: 'array', items: { type: 'string' } },
                        likes: { type: 'integer' },
                        dislikes: { type: 'integer' },
                    },
                },
                Error: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        error: { type: 'string' },
                    },
                },
            },
        },
        tags: [
            { name: 'Problems', description: 'Problem management endpoints' },
            { name: 'Auth', description: 'Authentication endpoints' },
        ],
    },
    apis: ['./src/api/v1/routes/*.ts'], // Path to route files
};

const specs = swaggerJsdoc(options);

export function setupSwagger(app: Express): void {
    app.use(
        '/api-docs',
        swaggerUi.serve,
        swaggerUi.setup(specs, {
            customCss: '.swagger-ui .topbar { display: none }',
            customSiteTitle: 'LeetCode API Docs',
        })
    );

    console.log('📚 Swagger docs available at /api-docs');
}